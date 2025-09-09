#!/bin/bash

# Production Backup Script for ECommerce Application
# This script creates comprehensive backups of the production system

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${BACKUP_ROOT:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

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

# Create backup directory
create_backup_dir() {
    local backup_date=$(date +'%Y%m%d_%H%M%S')
    BACKUP_DIR="$BACKUP_ROOT/backup_$backup_date"
    
    mkdir -p "$BACKUP_DIR"/{database,volumes,config,logs}
    
    log "Created backup directory: $BACKUP_DIR"
}

# Backup database
backup_database() {
    log "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/database/postgres_dump.sql"
    local db_backup_compressed="$BACKUP_DIR/database/postgres_dump.sql.gz"
    
    # Check if database container is running
    if ! docker-compose -f "$PROJECT_ROOT/docker-compose.yml" ps postgres | grep -q "Up"; then
        warning "PostgreSQL container is not running, skipping database backup"
        return 0
    fi
    
    # Create SQL dump
    cd "$PROJECT_ROOT"
    if docker-compose exec -T postgres pg_dump -U ecommerce_user -d ecommerce > "$db_backup_file"; then
        # Compress the SQL dump
        gzip "$db_backup_file"
        success "Database backup completed: $(du -h "$db_backup_compressed" | cut -f1)"
    else
        error "Database backup failed"
    fi
    
    # Create a table structure only backup (for quick restore testing)
    local schema_backup="$BACKUP_DIR/database/schema_only.sql"
    if docker-compose exec -T postgres pg_dump -U ecommerce_user -d ecommerce --schema-only > "$schema_backup"; then
        gzip "$schema_backup"
        success "Schema backup completed"
    else
        warning "Schema backup failed"
    fi
    
    # Export database statistics
    local stats_file="$BACKUP_DIR/database/db_stats.txt"
    {
        echo "=== Database Statistics ==="
        echo "Backup Date: $(date)"
        echo
        docker-compose exec postgres psql -U ecommerce_user -d ecommerce -c "
            SELECT 
                schemaname as schema,
                tablename as table,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes,
                n_live_tup as live_tuples,
                n_dead_tup as dead_tuples
            FROM pg_stat_user_tables 
            ORDER BY n_live_tup DESC;"
        
        echo
        echo "=== Database Size ==="
        docker-compose exec postgres psql -U ecommerce_user -d ecommerce -c "
            SELECT pg_size_pretty(pg_database_size('ecommerce')) as database_size;"
        
        echo
        echo "=== Table Sizes ==="
        docker-compose exec postgres psql -U ecommerce_user -d ecommerce -c "
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
    } > "$stats_file"
}

# Backup Docker volumes
backup_volumes() {
    log "Starting Docker volumes backup..."
    
    local volumes_dir="$BACKUP_DIR/volumes"
    
    # Backup PostgreSQL data volume
    if docker volume ls | grep -q "ecommerce_postgres_data"; then
        log "Backing up PostgreSQL data volume..."
        if docker run --rm \
            -v ecommerce_postgres_data:/source:ro \
            -v "$volumes_dir":/backup \
            alpine tar czf /backup/postgres_data.tar.gz -C /source .; then
            success "PostgreSQL volume backup completed"
        else
            warning "PostgreSQL volume backup failed"
        fi
    fi
    
    # Backup Redis data volume
    if docker volume ls | grep -q "ecommerce_redis_data"; then
        log "Backing up Redis data volume..."
        if docker run --rm \
            -v ecommerce_redis_data:/source:ro \
            -v "$volumes_dir":/backup \
            alpine tar czf /backup/redis_data.tar.gz -C /source .; then
            success "Redis volume backup completed"
        else
            warning "Redis volume backup failed"
        fi
    fi
    
    # Backup application logs volume (if exists)
    if docker volume ls | grep -q "ecommerce_backend_logs"; then
        log "Backing up application logs volume..."
        if docker run --rm \
            -v ecommerce_backend_logs:/source:ro \
            -v "$volumes_dir":/backup \
            alpine tar czf /backup/backend_logs.tar.gz -C /source .; then
            success "Backend logs volume backup completed"
        else
            warning "Backend logs volume backup failed"
        fi
    fi
}

# Backup configuration files
backup_config() {
    log "Starting configuration backup..."
    
    local config_dir="$BACKUP_DIR/config"
    
    # Backup environment file (without sensitive data)
    if [ -f "$PROJECT_ROOT/.env" ]; then
        # Create sanitized version of .env file
        sed 's/=.*/=***REDACTED***/g' "$PROJECT_ROOT/.env" > "$config_dir/.env.template"
        success "Environment template backed up"
    fi
    
    # Backup docker-compose configuration
    if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        cp "$PROJECT_ROOT/docker-compose.yml" "$config_dir/"
        success "Docker Compose configuration backed up"
    fi
    
    # Backup nginx configuration
    if [ -f "$PROJECT_ROOT/Frontend/ecommerce-frontend/nginx.conf" ]; then
        cp "$PROJECT_ROOT/Frontend/ecommerce-frontend/nginx.conf" "$config_dir/"
        success "Nginx configuration backed up"
    fi
    
    # Backup SSL certificates (if they exist)
    if [ -d "$PROJECT_ROOT/ssl" ]; then
        cp -r "$PROJECT_ROOT/ssl" "$config_dir/"
        success "SSL certificates backed up"
    fi
}

# Backup application logs
backup_logs() {
    log "Starting application logs backup..."
    
    local logs_dir="$BACKUP_DIR/logs"
    
    # Backup container logs
    cd "$PROJECT_ROOT"
    for service in backend frontend postgres redis; do
        if docker-compose ps | grep -q "$service"; then
            local log_file="$logs_dir/${service}.log"
            if docker-compose logs --no-color "$service" > "$log_file" 2>&1; then
                gzip "$log_file"
                success "$service logs backed up"
            else
                warning "$service logs backup failed"
            fi
        fi
    done
    
    # Backup system logs (if accessible)
    if [ -d "$PROJECT_ROOT/logs" ]; then
        cp -r "$PROJECT_ROOT/logs/"* "$logs_dir/" 2>/dev/null || true
        success "System logs backed up"
    fi
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/BACKUP_MANIFEST.txt"
    
    {
        echo "=== ECommerce Application Backup Manifest ==="
        echo "Backup Date: $(date)"
        echo "Backup Directory: $BACKUP_DIR"
        echo "Hostname: $(hostname)"
        echo "User: $(whoami)"
        echo
        echo "=== System Information ==="
        echo "OS: $(uname -a)"
        echo "Docker Version: $(docker --version)"
        echo "Docker Compose Version: $(docker-compose --version)"
        echo
        echo "=== Application State ==="
        echo "Running Containers:"
        docker-compose -f "$PROJECT_ROOT/docker-compose.yml" ps
        echo
        echo "Docker Images:"
        docker images | grep ecommerce
        echo
        echo "=== Backup Contents ==="
        echo "Files and sizes:"
        find "$BACKUP_DIR" -type f -exec ls -lh {} \; | awk '{print $9 " - " $5}'
        echo
        echo "Total backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"
        echo
        echo "=== Verification ==="
        echo "Database dump: $([ -f "$BACKUP_DIR/database/postgres_dump.sql.gz" ] && echo "✓ Present" || echo "✗ Missing")"
        echo "PostgreSQL volume: $([ -f "$BACKUP_DIR/volumes/postgres_data.tar.gz" ] && echo "✓ Present" || echo "✗ Missing")"
        echo "Redis volume: $([ -f "$BACKUP_DIR/volumes/redis_data.tar.gz" ] && echo "✓ Present" || echo "✗ Missing")"
        echo "Configuration: $([ -f "$BACKUP_DIR/config/docker-compose.yml" ] && echo "✓ Present" || echo "✗ Missing")"
        echo
        echo "=== Backup Completion ==="
        echo "Status: SUCCESS"
        echo "Completion Time: $(date)"
    } > "$manifest_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
    
    if [ -d "$BACKUP_ROOT" ]; then
        local deleted_count=0
        
        # Find and remove old backup directories
        while IFS= read -r -d '' backup_dir; do
            if rm -rf "$backup_dir"; then
                deleted_count=$((deleted_count + 1))
            fi
        done < <(find "$BACKUP_ROOT" -maxdepth 1 -type d -name "backup_*" -mtime +$RETENTION_DAYS -print0)
        
        if [ $deleted_count -gt 0 ]; then
            success "Removed $deleted_count old backup(s)"
        else
            log "No old backups to remove"
        fi
    fi
}

# Send backup notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Log to system log
    logger -t "ecommerce-backup" "$status: $message"
    
    # Send email notification (if configured)
    if [ -n "${BACKUP_EMAIL:-}" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "ECommerce Backup $status" "$BACKUP_EMAIL"
    fi
    
    # Send Slack notification (if webhook configured)
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔄 ECommerce Backup $status: $message\"}" \
            "$SLACK_WEBHOOK" >/dev/null 2>&1 || true
    fi
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    local verification_passed=true
    
    # Check if critical files exist
    local critical_files=(
        "$BACKUP_DIR/database/postgres_dump.sql.gz"
        "$BACKUP_DIR/BACKUP_MANIFEST.txt"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Critical backup file missing: $file"
            verification_passed=false
        fi
    done
    
    # Verify database dump integrity
    if [ -f "$BACKUP_DIR/database/postgres_dump.sql.gz" ]; then
        if ! gzip -t "$BACKUP_DIR/database/postgres_dump.sql.gz"; then
            error "Database backup file is corrupted"
            verification_passed=false
        fi
    fi
    
    # Verify archive integrity
    for archive in "$BACKUP_DIR/volumes"/*.tar.gz; do
        if [ -f "$archive" ]; then
            if ! tar -tzf "$archive" >/dev/null; then
                error "Volume backup archive is corrupted: $archive"
                verification_passed=false
            fi
        fi
    done
    
    if [ "$verification_passed" = true ]; then
        success "Backup integrity verification passed"
        return 0
    else
        error "Backup integrity verification failed"
        return 1
    fi
}

# Main backup function
main() {
    log "Starting ECommerce Production Backup"
    log "====================================="
    
    local start_time=$(date +%s)
    
    # Create backup directory
    create_backup_dir
    
    # Perform backups
    backup_database
    backup_volumes
    backup_config
    backup_logs
    
    # Create manifest
    create_manifest
    
    # Verify backup
    if verify_backup; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)
        
        success "Backup completed successfully!"
        success "Duration: ${duration}s, Size: $backup_size"
        success "Location: $BACKUP_DIR"
        
        # Cleanup old backups
        cleanup_old_backups
        
        # Send success notification
        send_notification "SUCCESS" "Backup completed in ${duration}s, size: $backup_size"
        
    else
        error "Backup verification failed"
        send_notification "FAILED" "Backup verification failed - please check logs"
        exit 1
    fi
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi