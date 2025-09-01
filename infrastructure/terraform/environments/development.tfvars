# AYNAMODA Development Environment Configuration
# This file contains development-specific variable values

# Project Configuration
project_id  = "aynamoda-dev"
region      = "europe-west1"
environment = "development"

# GKE Configuration
gke_num_nodes    = 2
gke_machine_type = "e2-medium"

# Database Configuration
db_tier = "db-f1-micro"
db_user = "aynamoda_dev"
# db_password should be set via environment variable or secure method

# Domain Configuration
domain_name = "dev.aynamoda.com"

# Feature Flags
enable_monitoring = true
enable_backup    = true
backup_retention_days = 3

# Node Pool Configuration
node_pool_config = {
  min_nodes    = 1
  max_nodes    = 3
  auto_upgrade = true
  auto_repair  = true
}

# Database Configuration
database_config = {
  high_availability = false
  backup_enabled   = true
  maintenance_window = {
    day  = 7  # Sunday
    hour = 3  # 3 AM
  }
}

# Storage Configuration
storage_config = {
  storage_class = "STANDARD"
  lifecycle_age = 30  # Shorter lifecycle for dev
}

# Monitoring Configuration
monitoring_config = {
  enable_uptime_checks = false  # Disabled for dev to save costs
  notification_channels = []
}

# Security Configuration
security_config = {
  enable_network_policy = true
  enable_pod_security_policy = true
  enable_workload_identity = true
}

# SSL Certificate Domains
ssl_certificate_domains = [
  "dev.aynamoda.com",
  "api-dev.aynamoda.com"
]

# Allowed CIDR blocks (more permissive for development)
allowed_cidr_blocks = [
  "0.0.0.0/0"  # Allow all for development
]

# Resource Tags
tags = {
  project     = "aynamoda"
  environment = "development"
  managed_by  = "terraform"
  team        = "platform"
  cost_center = "engineering"
  auto_delete = "true"  # Resources can be auto-deleted to save costs
}