# AYNAMODA Infrastructure - Outputs
# This file defines outputs that will be used by other systems or for reference

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

# GKE Cluster Outputs
output "gke_cluster_name" {
  description = "GKE Cluster name"
  value       = google_container_cluster.aynamoda_gke.name
}

output "gke_cluster_endpoint" {
  description = "GKE Cluster endpoint"
  value       = google_container_cluster.aynamoda_gke.endpoint
  sensitive   = true
}

output "gke_cluster_ca_certificate" {
  description = "GKE Cluster CA certificate"
  value       = google_container_cluster.aynamoda_gke.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "gke_cluster_location" {
  description = "GKE Cluster location"
  value       = google_container_cluster.aynamoda_gke.location
}

# Database Outputs
output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.aynamoda_postgres.name
}

output "database_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.aynamoda_postgres.connection_name
}

output "database_private_ip" {
  description = "Cloud SQL instance private IP"
  value       = google_sql_database_instance.aynamoda_postgres.private_ip_address
  sensitive   = true
}

output "database_public_ip" {
  description = "Cloud SQL instance public IP"
  value       = google_sql_database_instance.aynamoda_postgres.public_ip_address
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.aynamoda_db.name
}

output "database_user" {
  description = "Database user"
  value       = google_sql_user.aynamoda_user.name
}

# Network Outputs
output "vpc_network_name" {
  description = "VPC network name"
  value       = google_compute_network.aynamoda_vpc.name
}

output "vpc_network_id" {
  description = "VPC network ID"
  value       = google_compute_network.aynamoda_vpc.id
}

output "gke_subnet_name" {
  description = "GKE subnet name"
  value       = google_compute_subnetwork.gke_subnet.name
}

output "gke_subnet_cidr" {
  description = "GKE subnet CIDR"
  value       = google_compute_subnetwork.gke_subnet.ip_cidr_range
}

# Storage Outputs
output "assets_bucket_name" {
  description = "Assets storage bucket name"
  value       = google_storage_bucket.aynamoda_assets.name
}

output "assets_bucket_url" {
  description = "Assets storage bucket URL"
  value       = google_storage_bucket.aynamoda_assets.url
}

# Artifact Registry Outputs
output "artifact_registry_repository" {
  description = "Artifact Registry repository name"
  value       = google_artifact_registry_repository.aynamoda_repo.name
}

output "artifact_registry_location" {
  description = "Artifact Registry location"
  value       = google_artifact_registry_repository.aynamoda_repo.location
}

# Service Account Outputs
output "gke_service_account_email" {
  description = "GKE service account email"
  value       = google_service_account.gke_service_account.email
}

output "gke_service_account_id" {
  description = "GKE service account ID"
  value       = google_service_account.gke_service_account.unique_id
}

# Connection Information for Applications
output "database_connection_string" {
  description = "Database connection string for applications"
  value       = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.aynamoda_postgres.private_ip_address}:5432/${google_sql_database.aynamoda_db.name}"
  sensitive   = true
}

output "kubernetes_config_command" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.aynamoda_gke.name} --region ${google_container_cluster.aynamoda_gke.location} --project ${var.project_id}"
}

# Docker Registry Information
output "docker_registry_url" {
  description = "Docker registry URL for pushing images"
  value       = "${google_artifact_registry_repository.aynamoda_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.aynamoda_repo.repository_id}"
}

# Monitoring and Logging
output "monitoring_workspace" {
  description = "Google Cloud Monitoring workspace"
  value       = var.project_id
}

output "logging_project" {
  description = "Google Cloud Logging project"
  value       = var.project_id
}