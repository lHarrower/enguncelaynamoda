# AYNAMODA Infrastructure - Main Terraform Configuration
# This file defines the core GCP infrastructure including GKE cluster and PostgreSQL

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "container.googleapis.com",
    "sqladmin.googleapis.com",
    "compute.googleapis.com",
    "storage.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com"
  ])
  
  service = each.value
  disable_on_destroy = false
}

# VPC Network
resource "google_compute_network" "aynamoda_vpc" {
  name                    = "aynamoda-vpc"
  auto_create_subnetworks = false
  depends_on             = [google_project_service.required_apis]
}

# Subnet for GKE
resource "google_compute_subnetwork" "gke_subnet" {
  name          = "aynamoda-gke-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.aynamoda_vpc.id
  
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }
  
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# GKE Cluster
resource "google_container_cluster" "aynamoda_gke" {
  name     = "aynamoda-cluster"
  location = var.region
  
  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1
  
  network    = google_compute_network.aynamoda_vpc.name
  subnetwork = google_compute_subnetwork.gke_subnet.name
  
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }
  
  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  # Enable network policy
  network_policy {
    enabled = true
  }
  
  addons_config {
    network_policy_config {
      disabled = false
    }
  }
  
  depends_on = [google_project_service.required_apis]
}

# GKE Node Pool
resource "google_container_node_pool" "aynamoda_nodes" {
  name       = "aynamoda-node-pool"
  location   = var.region
  cluster    = google_container_cluster.aynamoda_gke.name
  node_count = var.gke_num_nodes
  
  node_config {
    preemptible  = var.environment == "development"
    machine_type = var.gke_machine_type
    
    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.gke_service_account.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
    
    labels = {
      environment = var.environment
      project     = "aynamoda"
    }
    
    tags = ["aynamoda-gke-node"]
    
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}

# Service Account for GKE nodes
resource "google_service_account" "gke_service_account" {
  account_id   = "aynamoda-gke-sa"
  display_name = "AYNAMODA GKE Service Account"
}

# IAM bindings for GKE service account
resource "google_project_iam_member" "gke_service_account_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer",
    "roles/storage.objectViewer",
    "roles/artifactregistry.reader"
  ])
  
  role   = each.value
  member = "serviceAccount:${google_service_account.gke_service_account.email}"
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "aynamoda_postgres" {
  name             = "aynamoda-postgres-${var.environment}"
  database_version = "POSTGRES_15"
  region          = var.region
  
  settings {
    tier = var.db_tier
    
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }
    
    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.aynamoda_vpc.id
      authorized_networks {
        name  = "gke-cluster"
        value = google_compute_subnetwork.gke_subnet.ip_cidr_range
      }
    }
    
    database_flags {
      name  = "shared_preload_libraries"
      value = "vector"
    }
  }
  
  deletion_protection = var.environment == "production"
  depends_on         = [google_project_service.required_apis]
}

# Database
resource "google_sql_database" "aynamoda_db" {
  name     = "aynamoda"
  instance = google_sql_database_instance.aynamoda_postgres.name
}

# Database user
resource "google_sql_user" "aynamoda_user" {
  name     = var.db_user
  instance = google_sql_database_instance.aynamoda_postgres.name
  password = var.db_password
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "aynamoda_repo" {
  location      = var.region
  repository_id = "aynamoda"
  description   = "AYNAMODA container images"
  format        = "DOCKER"
  
  depends_on = [google_project_service.required_apis]
}

# Cloud Storage bucket for images and assets
resource "google_storage_bucket" "aynamoda_assets" {
  name     = "${var.project_id}-aynamoda-assets-${var.environment}"
  location = var.region
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

# IAM for Cloud Storage
resource "google_storage_bucket_iam_member" "aynamoda_assets_access" {
  bucket = google_storage_bucket.aynamoda_assets.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.gke_service_account.email}"
}