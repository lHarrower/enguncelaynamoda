#!/bin/bash

# AYNAMODA Database Migration Script
# This script handles database migrations for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
ACTION="up"
STEPS=""
VERBOSE=false
DRY_RUN=false

# Database connection variables
DB_HOST=""
DB_PORT="5432"
DB_NAME="aynamoda"
DB_USER=""
DB_PASSWORD=""
DB_SSL_MODE="require"

# Migration directory
MIGRATION_DIR="../api/migrations"

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

Database Migration Script for AYNAMODA

OPTIONS:
    -e, --environment ENV    Environment (development|staging|production) [default: development]
    -a, --action ACTION      Migration action (up|down|drop|force|version) [default: up]
    -s, --steps STEPS        Number of migration steps (for up/down actions)
    -v, --verbose           Enable verbose output
    -d, --dry-run           Show what would be executed without running
    -h, --help              Show this help message

EXAMPLES:
    $0 --environment development --action up
    $0 -e staging -a down -s 1
    $0 -e production -a version
    $0 --dry-run --verbose

ENVIRONMENT VARIABLES:
    DB_HOST                 Database host
    DB_PORT                 Database port [default: 5432]
    DB_NAME                 Database name [default: aynamoda]
    DB_USER                 Database user
    DB_PASSWORD             Database password
    DB_SSL_MODE             SSL mode [default: require]

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
}

# Function to check if migrate tool is installed
check_migrate_tool() {
    if ! command -v migrate &> /dev/null; then
        print_error "migrate tool is not installed"
        print_info "Install it with: go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest"
        exit 1
    fi
}

# Function to build database URL
build_db_url() {
    echo "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSL_MODE"
}

# Function to test database connection
test_db_connection() {
    local db_url=$(build_db_url)
    
    print_info "Testing database connection..."
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would test connection to: $DB_HOST:$DB_PORT/$DB_NAME"
        return 0
    fi
    
    if migrate -database "$db_url" -path "$MIGRATION_DIR" version &> /dev/null; then
        print_success "Database connection successful"
    else
        print_error "Failed to connect to database"
        exit 1
    fi
}

# Function to run migrations
run_migration() {
    local db_url=$(build_db_url)
    local cmd="migrate -database \"$db_url\" -path \"$MIGRATION_DIR\""
    
    case $ACTION in
        "up")
            if [[ -n "$STEPS" ]]; then
                cmd="$cmd up $STEPS"
            else
                cmd="$cmd up"
            fi
            ;;
        "down")
            if [[ -n "$STEPS" ]]; then
                cmd="$cmd down $STEPS"
            else
                print_error "Steps parameter is required for down migration"
                exit 1
            fi
            ;;
        "drop")
            print_warning "This will drop all tables and data!"
            read -p "Are you sure? (yes/no): " -r
            if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
                print_info "Migration cancelled"
                exit 0
            fi
            cmd="$cmd drop"
            ;;
        "force")
            if [[ -z "$STEPS" ]]; then
                print_error "Version parameter is required for force migration"
                exit 1
            fi
            cmd="$cmd force $STEPS"
            ;;
        "version")
            cmd="$cmd version"
            ;;
        *)
            print_error "Invalid action: $ACTION"
            exit 1
            ;;
    esac
    
    print_info "Running migration: $ACTION"
    
    if $VERBOSE; then
        print_info "Command: $cmd"
    fi
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would execute: $cmd"
        return 0
    fi
    
    # Execute the migration
    if eval $cmd; then
        print_success "Migration completed successfully"
    else
        print_error "Migration failed"
        exit 1
    fi
}

# Function to backup database (production only)
backup_database() {
    if [[ "$ENVIRONMENT" != "production" ]]; then
        return 0
    fi
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="backup_${DB_NAME}_${timestamp}.sql"
    
    print_info "Creating database backup: $backup_file"
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would create backup: $backup_file"
        return 0
    fi
    
    if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"; then
        print_success "Database backup created: $backup_file"
    else
        print_error "Failed to create database backup"
        exit 1
    fi
}

# Function to show current migration status
show_status() {
    local db_url=$(build_db_url)
    
    print_info "Current migration status:"
    
    if $DRY_RUN; then
        print_info "[DRY RUN] Would show migration status"
        return 0
    fi
    
    migrate -database "$db_url" -path "$MIGRATION_DIR" version
    
    print_info "Available migrations:"
    ls -la "$MIGRATION_DIR" | grep -E '\.(up|down)\.sql$' | sort
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -s|--steps)
            STEPS="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dry-run)
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
    print_info "AYNAMODA Database Migration Script"
    print_info "Environment: $ENVIRONMENT"
    print_info "Action: $ACTION"
    
    if $DRY_RUN; then
        print_warning "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Check prerequisites
    check_migrate_tool
    
    # Load environment variables
    load_env_vars
    
    # Test database connection
    test_db_connection
    
    # Show current status
    show_status
    
    # Create backup for production
    if [[ "$ACTION" != "version" ]]; then
        backup_database
    fi
    
    # Run migration
    if [[ "$ACTION" != "version" ]]; then
        run_migration
    fi
    
    print_success "Migration script completed"
}

# Run main function
main "$@"