# AYNAMODA Production Environment Configuration
# This file contains production-specific variable values

# Project Configuration
project_id  = "aynamoda-prod"
region      = "europe-west1"
environment = "production"

# GKE Configuration
gke_num_nodes    = 3
gke_machine_type = "e2-standard-4"

# Database Configuration
db_tier = "db-custom-2-7680"  # 2 vCPUs, 7.5 GB RAM
db_user = "aynamoda_prod"
# db_password should be set via environment variable or secure method

# Domain Configuration
domain_name = "aynamoda.com"

# Feature Flags
enable_monitoring = true
enable_backup    = true
backup_retention_days = 30

# Node Pool Configuration
node_pool_config = {
  min_nodes    = 2
  max_nodes    = 10
  auto_upgrade = true
  auto_repair  = true
}

# Database Configuration
database_config = {
  high_availability = true
  backup_enabled   = true
  maintenance_window = {
    day  = 7  # Sunday
    hour = 3  # 3 AM
  }
}

# Storage Configuration
storage_config = {
  storage_class = "STANDARD"
  lifecycle_age = 365
}

# Monitoring Configuration
monitoring_config = {
  enable_uptime_checks = true
  notification_channels = [
    # Add notification channel IDs here
  ]
}

# Security Configuration
security_config = {
  enable_network_policy = true
  enable_pod_security_policy = true
  enable_workload_identity = true
}

# SSL Certificate Domains
ssl_certificate_domains = [
  "aynamoda.com",
  "www.aynamoda.com",
  "api.aynamoda.com"
]

# Allowed CIDR blocks (restrictive for production)
allowed_cidr_blocks = [
  "10.0.0.0/8",     # Private networks
  "172.16.0.0/12",  # Private networks
  "192.168.0.0/16"  # Private networks
]

# Resource Tags
tags = {
  project     = "aynamoda"
  environment = "production"
  managed_by  = "terraform"
  team        = "platform"
  cost_center = "production"
  backup      = "required"
  monitoring  = "critical"
}