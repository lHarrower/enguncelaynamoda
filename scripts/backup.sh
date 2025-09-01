#!/bin/bash

# AYNAMODA Database Backup Script
# This script handles automated database backups for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
BACKUP_TYPE="full"
COMPRESSION="gzip"
RETENTION_DAYS=30
VERBOSE=false
DRY_RUN=false
UPLOAD_TO_GCS=false

# Database connection variables
DB_HOST=""
DB_PORT="5432"
DB_NAME="aynamoda"
DB_USER=""
DB_PASSWORD=""

# Backup configuration
BACKUP_DIR="./backups"
GCS_BUCKET=""
GCS_PREFIX="database-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Database Backup Script for AYNAMODA

OPTIONS:
    -e, --environment ENV    Environment (development|staging|production) [default: development]
    -t, --type TYPE          Backup type (full|schema|data) [default: full]
    -c, --compression TYPE   Compression type (gzip|none) [default: gzip]
    -r, --retention DAYS     Retention period in days [default: 30]
    -d, --directory DIR      Backup directory [default: ./backups]
    -g, --gcs-upload         Upload backup to Google Cloud Storage
    -b, --bucket BUCKET      GCS bucket name (required if --gcs-upload)
    -v, --verbose           Enable verbose output
    --dry-run               Show what would be executed without running
    -h, --help              Show this help message

EXAMPLES:
    $0 --environment production --type full --gcs-upload
    $0 -e staging -t schema -c none
    $0 --dry-run --verbose

ENVIRONMENT VARIABLES:
    DB_HOST                 Database host
    DB_PORT                 Database port [default: 5432]
    DB_NAME                 Database name [default: aynamoda]
    DB_USER                 Database user
    DB_PASSWORD             Database password
    GCS_BUCKET              Google Cloud Storage bucket
    GOOGLE_APPLICATION_CREDENTIALS  Path to GCS service account key

EOF
}

# Function to load environment variables
load_env_vars() {
    local env_file=""
    
    case $ENVIRONMENT in
        "development")
            env_file="../.env.development"
            ;;
        "staging")
            env_file="../.env.staging"
            ;;
        "production")
            env_file="../.env.production"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    if [[ -f "$env_file" ]]; then
        print_info "Loading environment variables from $env_file"
        source "$env_file"
    else
        print_warning "Environment file $env_file not found, using environment variables"
    fi
    
    # Validate required variables
    if [[ -z "$DB_HOST" ]]; then
        print_error "DB_HOST is required"
        exit 1
    fi
    
    if [[ -z "$DB_USER" ]]; then
        print_error "DB_USER is required"
        exit 1
    fi
    
    if [[ -z "$DB_PASSWORD" ]]; then
        print_error "DB_PASSWORD is required"
        exit 1
    fi
    
    # Set GCS bucket if not provided via command line
    if [[ -z "$GCS_BUCKET" && -n "$GCS_BUCKET_NAME" ]]; then
        GCS_BUCKET="$GCS_BUCKET_NAME"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    # Check if pg_dump is installed
    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump is not installed"
        exit 1
    fi
    
    # Check if gzip is available (if compression is enabled)
    if [[ "$COMPRESSION" == "gzip" ]] && ! command -v gzip &> /dev/null; then
        print_error "gzip is not installed"
        exit 1
    fi
    
    # Check if gsutil is available (if GCS upload is enabled)
    if $UPLOAD_TO_GCS && ! command -v gsutil &> /dev/null; then
        print_error "gsutil is not installed (required for GCS upload)"
        exit 1
    fi
    
    # Validate GCS bucket if upload is enabled
    if $UPLOAD_TO_GCS && [[ -z "$GCS_BUCKET" ]]; then
        print_error "GCS bucket is required when --gcs-upload is enabled"
        exit 1
    fi
}

# Function to create backup directory
setup_backup_directory() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_info "Creating backup directory: $BACKUP_DIR"
        
        if $DRY_RUN; then
            print_info "[DRY RUN] Would create directory: $BACKUP_DIR"
        else
            mkdir -p "$BACKUP_DIR"
        fi
    fi
}

# Function to test database connection
test_db_connection() {
    print_info "Testing database connection..."
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would test connection to: $DB_HOST:$DB_PORT/$DB_NAME"
        return 0
    fi
    
    if PGPASSWORD="$DB_PASSWORD" pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" &> /dev/null; then
        print_success "Database connection successful"
    else
        print_error "Failed to connect to database"
        exit 1
    fi
}

# Function to create database backup
create_backup() {
    local backup_filename="${DB_NAME}_${ENVIRONMENT}_${BACKUP_TYPE}_${TIMESTAMP}"
    local backup_path="$BACKUP_DIR/$backup_filename.sql"
    
    # Add compression extension if enabled
    if [[ "$COMPRESSION" == "gzip" ]]; then
        backup_path="${backup_path}.gz"
    fi
    
    print_info "Creating $BACKUP_TYPE backup: $backup_filename"
    
    # Build pg_dump command based on backup type
    local pg_dump_cmd="PGPASSWORD='$DB_PASSWORD' pg_dump -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER'"
    
    case $BACKUP_TYPE in
        "full")
            pg_dump_cmd="$pg_dump_cmd -d '$DB_NAME'"
            ;;
        "schema")
            pg_dump_cmd="$pg_dump_cmd -s -d '$DB_NAME'"
            ;;
        "data")
            pg_dump_cmd="$pg_dump_cmd -a -d '$DB_NAME'"
            ;;
        *)
            print_error "Invalid backup type: $BACKUP_TYPE"
            exit 1
            ;;
    esac
    
    # Add compression if enabled
    if [[ "$COMPRESSION" == "gzip" ]]; then
        pg_dump_cmd="$pg_dump_cmd | gzip"
    fi
    
    # Add output redirection
    pg_dump_cmd="$pg_dump_cmd > '$backup_path'"
    
    if $VERBOSE; then
        print_info "Command: $pg_dump_cmd"
    fi
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would create backup: $backup_path"
        return 0
    fi
    
    # Execute backup command
    if eval $pg_dump_cmd; then
        local backup_size=$(du -h "$backup_path" | cut -f1)
        print_success "Backup created successfully: $backup_path ($backup_size)"
        
        # Store backup path for potential GCS upload
        CREATED_BACKUP_PATH="$backup_path"
        CREATED_BACKUP_FILENAME="$backup_filename"
    else
        print_error "Failed to create backup"
        exit 1
    fi
}

# Function to upload backup to Google Cloud Storage
upload_to_gcs() {
    if ! $UPLOAD_TO_GCS || [[ -z "$CREATED_BACKUP_PATH" ]]; then
        return 0
    fi
    
    local gcs_path="gs://$GCS_BUCKET/$GCS_PREFIX/$ENVIRONMENT/$CREATED_BACKUP_FILENAME"
    
    if [[ "$COMPRESSION" == "gzip" ]]; then
        gcs_path="${gcs_path}.sql.gz"
    else
        gcs_path="${gcs_path}.sql"
    fi
    
    print_info "Uploading backup to GCS: $gcs_path"
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would upload to: $gcs_path"
        return 0
    fi
    
    if gsutil cp "$CREATED_BACKUP_PATH" "$gcs_path"; then
        print_success "Backup uploaded to GCS successfully"
        
        # Set lifecycle policy for automatic cleanup
        local lifecycle_config=$(mktemp)
        cat > "$lifecycle_config" << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": $RETENTION_DAYS}
      }
    ]
  }
}
EOF
        
        gsutil lifecycle set "$lifecycle_config" "gs://$GCS_BUCKET" 2>/dev/null || true
        rm "$lifecycle_config"
    else
        print_error "Failed to upload backup to GCS"
        exit 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_info "Cleaning up backups older than $RETENTION_DAYS days"
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would clean up old backups in: $BACKUP_DIR"
        find "$BACKUP_DIR" -name "*.sql*" -type f -mtime +$RETENTION_DAYS -ls 2>/dev/null || true
        return 0
    fi
    
    local deleted_count=0
    while IFS= read -r -d '' file; do
        print_info "Deleting old backup: $(basename "$file")"
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "*.sql*" -type f -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    if [[ $deleted_count -gt 0 ]]; then
        print_success "Cleaned up $deleted_count old backup(s)"
    else
        print_info "No old backups to clean up"
    fi
}

# Function to verify backup integrity
verify_backup() {
    if [[ -z "$CREATED_BACKUP_PATH" ]] || $DRY_RUN; then
        return 0
    fi
    
    print_info "Verifying backup integrity..."
    
    # Check if file exists and is not empty
    if [[ ! -f "$CREATED_BACKUP_PATH" ]]; then
        print_error "Backup file does not exist: $CREATED_BACKUP_PATH"
        exit 1
    fi
    
    if [[ ! -s "$CREATED_BACKUP_PATH" ]]; then
        print_error "Backup file is empty: $CREATED_BACKUP_PATH"
        exit 1
    fi
    
    # Verify gzip integrity if compressed
    if [[ "$COMPRESSION" == "gzip" ]]; then
        if gzip -t "$CREATED_BACKUP_PATH" 2>/dev/null; then
            print_success "Backup compression integrity verified"
        else
            print_error "Backup compression is corrupted"
            exit 1
        fi
    fi
    
    print_success "Backup integrity verified"
}

# Function to send notification (placeholder)
send_notification() {
    local status=$1
    local message=$2
    
    # This is a placeholder for notification integration
    # You can integrate with Slack, email, or other notification systems
    
    if $VERBOSE; then
        print_info "Notification: [$status] $message"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        -c|--compression)
            COMPRESSION="$2"
            shift 2
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -d|--directory)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -g|--gcs-upload)
            UPLOAD_TO_GCS=true
            shift
            ;;
        -b|--bucket)
            GCS_BUCKET="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_info "AYNAMODA Database Backup Script"
    print_info "Environment: $ENVIRONMENT"
    print_info "Backup Type: $BACKUP_TYPE"
    print_info "Compression: $COMPRESSION"
    print_info "Retention: $RETENTION_DAYS days"
    
    if $DRY_RUN; then
        print_warning "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Load environment variables
    load_env_vars
    
    # Check prerequisites
    check_prerequisites
    
    # Setup backup directory
    setup_backup_directory
    
    # Test database connection
    test_db_connection
    
    # Create backup
    create_backup
    
    # Verify backup integrity
    verify_backup
    
    # Upload to GCS if enabled
    upload_to_gcs
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send success notification
    send_notification "SUCCESS" "Database backup completed successfully for $ENVIRONMENT environment"
    
    print_success "Backup script completed successfully"
}

# Error handling
trap 'print_error "Backup script failed with exit code $?"; send_notification "ERROR" "Database backup failed for $ENVIRONMENT environment"; exit 1' ERR

# Run main function
main "$@"