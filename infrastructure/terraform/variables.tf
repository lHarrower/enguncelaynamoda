# AYNAMODA Infrastructure - Variables
# This file defines all the variables used in the Terraform configuration

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "europe-west1"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  default     = "development"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "gke_num_nodes" {
  description = "Number of GKE nodes"
  type        = number
  default     = 2
}

variable "gke_machine_type" {
  description = "Machine type for GKE nodes"
  type        = string
  default     = "e2-medium"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_user" {
  description = "Database username"
  type        = string
  default     = "aynamoda"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "aynamoda.com"
}

variable "enable_monitoring" {
  description = "Enable monitoring and logging"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "ssl_certificate_domains" {
  description = "Domains for SSL certificate"
  type        = list(string)
  default     = []
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the cluster"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "node_pool_config" {
  description = "Configuration for GKE node pools"
  type = object({
    min_nodes    = number
    max_nodes    = number
    auto_upgrade = bool
    auto_repair  = bool
  })
  default = {
    min_nodes    = 1
    max_nodes    = 5
    auto_upgrade = true
    auto_repair  = true
  }
}

variable "database_config" {
  description = "Database configuration settings"
  type = object({
    high_availability = bool
    backup_enabled   = bool
    maintenance_window = object({
      day  = number
      hour = number
    })
  })
  default = {
    high_availability = false
    backup_enabled   = true
    maintenance_window = {
      day  = 7  # Sunday
      hour = 3  # 3 AM
    }
  }
}

variable "storage_config" {
  description = "Storage configuration"
  type = object({
    storage_class = string
    lifecycle_age = number
  })
  default = {
    storage_class = "STANDARD"
    lifecycle_age = 365
  }
}

variable "monitoring_config" {
  description = "Monitoring and alerting configuration"
  type = object({
    enable_uptime_checks = bool
    notification_channels = list(string)
  })
  default = {
    enable_uptime_checks = true
    notification_channels = []
  }
}

variable "security_config" {
  description = "Security configuration"
  type = object({
    enable_network_policy = bool
    enable_pod_security_policy = bool
    enable_workload_identity = bool
  })
  default = {
    enable_network_policy = true
    enable_pod_security_policy = true
    enable_workload_identity = true
  }
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    project     = "aynamoda"
    managed_by  = "terraform"
    team        = "platform"
  }
}