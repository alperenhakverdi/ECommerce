#!/bin/bash

# Production Restore Script for ECommerce Application
# This script restores the application from backup

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${BACKUP_ROOT:-$PROJECT_ROOT/backups}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Display usage
usage() {
    echo "Usage: $0 [OPTIONS] BACKUP_PATH"
    echo
    echo "Restore ECommerce application from backup"
    echo
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  --database-only         Restore only database"
    echo "  --volumes-only          Restore only Docker volumes"
    echo "  --config-only           Restore only configuration"
    echo "  --verify                Verify backup before restore"
    echo "  --dry-run               Show what would be restored without doing it"
    echo "  --force                 Skip confirmation prompts"
    echo
    echo "Examples:"
    echo "  $0 /path/to/backup_20231201_120000"
    echo "  $0 --database-only backup_20231201_120000"
    echo "  $0 --dry-run /backups/latest"
    echo
    exit 1
}

# Parse command line arguments
parse_arguments() {
    BACKUP_PATH=""
    DATABASE_ONLY=false
    VOLUMES_ONLY=false
    CONFIG_ONLY=false
    VERIFY_BACKUP=false
    DRY_RUN=false
    FORCE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                ;;
            --database-only)
                DATABASE_ONLY=true
                shift
                ;;
            --volumes-only)
                VOLUMES_ONLY=true
                shift
                ;;
            --config-only)
                CONFIG_ONLY=true
                shift
                ;;
            --verify)
                VERIFY_BACKUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                if [ -z "$BACKUP_PATH" ]; then
                    BACKUP_PATH="$1"
                else
                    error "Multiple backup paths specified"
                fi
                shift
                ;;
        esac
    done
    
    if [ -z "$BACKUP_PATH" ]; then
        error "Backup path is required"
    fi
    
    # Convert relative path to absolute
    if [[ ! "$BACKUP_PATH" = /* ]]; then
        BACKUP_PATH="$BACKUP_ROOT/$BACKUP_PATH"
    fi
}

# Verify backup exists and is valid
verify_backup_integrity() {
    log "Verifying backup integrity..."
    
    if [ ! -d "$BACKUP_PATH" ]; then
        error "Backup directory does not exist: $BACKUP_PATH"
    fi
    
    # Check for manifest file
    local manifest="$BACKUP_PATH/BACKUP_MANIFEST.txt"
    if [ ! -f "$manifest" ]; then
        error "Backup manifest not found: $manifest"
    fi
    
    success "Backup manifest found"
    
    # Display backup information
    echo
    echo "=== Backup Information ==="
    head -20 "$manifest"
    echo
    
    # Verify critical files
    local critical_files=()
    
    if [ "$DATABASE_ONLY" = true ] || [ "$VOLUMES_ONLY" = false ] && [ "$CONFIG_ONLY" = false ]; then
        critical_files+=("$BACKUP_PATH/database/postgres_dump.sql.gz")
    fi
    
    if [ "$VOLUMES_ONLY" = true ] || [ "$DATABASE_ONLY" = false ] && [ "$CONFIG_ONLY" = false ]; then
        # Volume files are optional, but check if they should exist
        if [ -f "$BACKUP_PATH/volumes/postgres_data.tar.gz" ]; then
            critical_files+=("$BACKUP_PATH/volumes/postgres_data.tar.gz")
        fi
    fi
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Critical backup file missing: $file"
        fi
        
        # Test file integrity
        case "$file" in
            *.gz)
                if ! gzip -t "$file"; then
                    error "Corrupted backup file: $file"
                fi
                ;;
            *.tar.gz)
                if ! tar -tzf "$file" >/dev/null; then
                    error "Corrupted archive file: $file"
                fi
                ;;
        esac
    done
    
    success "Backup integrity verification passed"
}

# Confirm restore operation
confirm_restore() {
    if [ "$FORCE" = true ]; then
        return 0
    fi
    
    echo
    warning "This will restore the ECommerce application from backup"
    warning "Current data will be PERMANENTLY LOST"
    echo
    echo "Backup: $BACKUP_PATH"
    echo "Components to restore:"
    [ "$DATABASE_ONLY" = true ] && echo "  - Database only"
    [ "$VOLUMES_ONLY" = true ] && echo "  - Docker volumes only"  
    [ "$CONFIG_ONLY" = true ] && echo "  - Configuration only"
    [ "$DATABASE_ONLY" = false ] && [ "$VOLUMES_ONLY" = false ] && [ "$CONFIG_ONLY" = false ] && echo "  - Complete system"
    echo
    
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
}

# Create pre-restore backup
create_prerestore_backup() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would create pre-restore backup"
        return 0
    fi
    
    log "Creating pre-restore backup..."
    
    local prerestore_dir="$PROJECT_ROOT/backups/prerestore_$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$prerestore_dir"
    
    # Quick database backup
    cd "$PROJECT_ROOT"
    if docker-compose ps postgres | grep -q "Up"; then
        docker-compose exec -T postgres pg_dump -U ecommerce_user -d ecommerce | gzip > "$prerestore_dir/prerestore_database.sql.gz" || warning "Pre-restore database backup failed"
    fi
    
    success "Pre-restore backup created: $prerestore_dir"
}

# Stop application services
stop_services() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would stop application services"
        return 0
    fi
    
    log "Stopping application services..."
    
    cd "$PROJECT_ROOT"
    
    # Stop application containers but keep database for restore
    if [ "$DATABASE_ONLY" = true ]; then
        # Keep postgres running for database restore
        docker-compose stop backend frontend redis || warning "Some services were not running"
    else
        # Stop all services
        docker-compose down || warning "Some services were already stopped"
    fi
    
    success "Services stopped"
}

# Restore database
restore_database() {
    local db_backup="$BACKUP_PATH/database/postgres_dump.sql.gz"
    
    if [ ! -f "$db_backup" ]; then
        warning "Database backup not found, skipping database restore"
        return 0
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would restore database from: $db_backup"
        return 0
    fi
    
    log "Restoring database..."
    
    cd "$PROJECT_ROOT"
    
    # Ensure database is running
    docker-compose up -d postgres
    
    # Wait for database to be ready
    local max_attempts=30
    local attempt=0
    
    while ! docker-compose exec postgres pg_isready -U ecommerce_user -d ecommerce >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            error "Database failed to start within expected time"
        fi
        sleep 2
    done
    
    # Drop existing connections to the database
    docker-compose exec postgres psql -U postgres -c "
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = 'ecommerce' AND pid <> pg_backend_pid();" || warning "Could not terminate existing connections"
    
    # Restore database
    log "Importing database dump..."
    if zcat "$db_backup" | docker-compose exec -T postgres psql -U ecommerce_user -d ecommerce; then
        success "Database restored successfully"
    else
        error "Database restore failed"
    fi
    
    # Update database statistics
    docker-compose exec postgres psql -U ecommerce_user -d ecommerce -c "ANALYZE;" || warning "Database analysis failed"
}

# Restore Docker volumes
restore_volumes() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would restore Docker volumes"
        return 0
    fi
    
    log "Restoring Docker volumes..."
    
    local volumes_dir="$BACKUP_PATH/volumes"
    
    # Restore PostgreSQL data volume
    local postgres_backup="$volumes_dir/postgres_data.tar.gz"
    if [ -f "$postgres_backup" ]; then
        log "Restoring PostgreSQL data volume..."
        
        # Remove existing volume
        docker volume rm ecommerce_postgres_data 2>/dev/null || true
        
        # Create new volume and restore data
        docker volume create ecommerce_postgres_data
        if docker run --rm -v ecommerce_postgres_data:/target -v "$volumes_dir":/source alpine tar xzf /source/postgres_data.tar.gz -C /target; then
            success "PostgreSQL volume restored"
        else
            error "PostgreSQL volume restore failed"
        fi
    fi
    
    # Restore Redis data volume
    local redis_backup="$volumes_dir/redis_data.tar.gz"
    if [ -f "$redis_backup" ]; then
        log "Restoring Redis data volume..."
        
        # Remove existing volume
        docker volume rm ecommerce_redis_data 2>/dev/null || true
        
        # Create new volume and restore data
        docker volume create ecommerce_redis_data
        if docker run --rm -v ecommerce_redis_data:/target -v "$volumes_dir":/source alpine tar xzf /source/redis_data.tar.gz -C /target; then
            success "Redis volume restored"
        else
            warning "Redis volume restore failed"
        fi
    fi
    
    # Restore application logs volume
    local logs_backup="$volumes_dir/backend_logs.tar.gz"
    if [ -f "$logs_backup" ]; then
        log "Restoring application logs volume..."
        
        docker volume rm ecommerce_backend_logs 2>/dev/null || true
        docker volume create ecommerce_backend_logs
        if docker run --rm -v ecommerce_backend_logs:/target -v "$volumes_dir":/source alpine tar xzf /source/backend_logs.tar.gz -C /target; then
            success "Application logs volume restored"
        else
            warning "Application logs volume restore failed"
        fi
    fi
}

# Restore configuration
restore_configuration() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would restore configuration files"
        return 0
    fi
    
    log "Restoring configuration files..."
    
    local config_dir="$BACKUP_PATH/config"
    
    if [ ! -d "$config_dir" ]; then
        warning "Configuration backup not found, skipping configuration restore"
        return 0
    fi
    
    # Restore docker-compose.yml
    if [ -f "$config_dir/docker-compose.yml" ]; then
        if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
            cp "$PROJECT_ROOT/docker-compose.yml" "$PROJECT_ROOT/docker-compose.yml.backup.$(date +%s)"
        fi
        cp "$config_dir/docker-compose.yml" "$PROJECT_ROOT/"
        success "Docker Compose configuration restored"
    fi
    
    # Restore nginx configuration
    if [ -f "$config_dir/nginx.conf" ]; then
        local nginx_path="$PROJECT_ROOT/Frontend/ecommerce-frontend/nginx.conf"
        if [ -f "$nginx_path" ]; then
            cp "$nginx_path" "$nginx_path.backup.$(date +%s)"
        fi
        cp "$config_dir/nginx.conf" "$nginx_path"
        success "Nginx configuration restored"
    fi
    
    # Restore SSL certificates
    if [ -d "$config_dir/ssl" ]; then
        if [ -d "$PROJECT_ROOT/ssl" ]; then
            mv "$PROJECT_ROOT/ssl" "$PROJECT_ROOT/ssl.backup.$(date +%s)"
        fi
        cp -r "$config_dir/ssl" "$PROJECT_ROOT/"
        success "SSL certificates restored"
    fi
    
    warning "Environment file (.env) was not restored for security reasons"
    warning "Please manually review and update the environment configuration"
}

# Start services after restore
start_services() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would start application services"
        return 0
    fi
    
    log "Starting application services..."
    
    cd "$PROJECT_ROOT"
    
    # Start all services
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for services to become healthy..."
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "unhealthy\|starting"; then
            attempt=$((attempt + 1))
            sleep 5
        else
            break
        fi
    done
    
    if [ $attempt -ge $max_attempts ]; then
        error "Services failed to become healthy within expected time"
    fi
    
    success "Application services started successfully"
}

# Verify restore
verify_restore() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY RUN] Would verify restore"
        return 0
    fi
    
    log "Verifying restore..."
    
    cd "$PROJECT_ROOT"
    
    # Check service health
    local backend_health=$(curl -s http://localhost:5000/health && echo "OK" || echo "FAILED")
    local frontend_health=$(curl -s http://localhost:3000/health && echo "OK" || echo "FAILED")
    
    echo
    echo "=== Restore Verification Results ==="
    echo "Backend Health: $backend_health"
    echo "Frontend Health: $frontend_health"
    
    # Check database connectivity
    if docker-compose exec postgres psql -U ecommerce_user -d ecommerce -c "SELECT 1;" >/dev/null 2>&1; then
        echo "Database Connectivity: OK"
    else
        echo "Database Connectivity: FAILED"
    fi
    
    # Check Redis connectivity
    if docker-compose exec redis redis-cli ping | grep -q PONG; then
        echo "Redis Connectivity: OK"
    else
        echo "Redis Connectivity: FAILED"
    fi
    
    echo "=========================="
    
    if [ "$backend_health" = "OK" ] && [ "$frontend_health" = "OK" ]; then
        success "Restore verification passed"
    else
        warning "Some health checks failed - please review the application status"
    fi
}

# Main restore function
main() {
    log "Starting ECommerce Production Restore"
    log "====================================="
    
    local start_time=$(date +%s)
    
    # Verify backup integrity
    verify_backup_integrity
    
    # Additional verification if requested
    if [ "$VERIFY_BACKUP" = true ]; then
        success "Backup verification completed"
        exit 0
    fi
    
    # Confirm restore operation
    confirm_restore
    
    # Create pre-restore backup
    create_prerestore_backup
    
    # Stop services
    stop_services
    
    # Perform restore based on options
    if [ "$DATABASE_ONLY" = true ]; then
        restore_database
    elif [ "$VOLUMES_ONLY" = true ]; then
        restore_volumes
    elif [ "$CONFIG_ONLY" = true ]; then
        restore_configuration
    else
        # Full restore
        restore_volumes
        restore_database
        restore_configuration
    fi
    
    # Start services
    if [ "$CONFIG_ONLY" = false ]; then
        start_services
        verify_restore
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ "$DRY_RUN" = true ]; then
        success "Dry run completed in ${duration}s"
        log "No actual changes were made"
    else
        success "Restore completed successfully in ${duration}s"
        log "Application should now be running with restored data"
        echo
        echo "🌐 Application URLs:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:5000"
        echo "   API Documentation: http://localhost:5000/swagger"
    fi
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    parse_arguments "$@"
    main
fi