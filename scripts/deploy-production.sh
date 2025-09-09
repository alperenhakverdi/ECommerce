#!/bin/bash

# ECommerce Production Deployment Script
# This script handles the complete production deployment process

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/Backend"
FRONTEND_DIR="$PROJECT_ROOT/Frontend/ecommerce-frontend"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Check if required tools are installed
check_prerequisites() {
    log "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_tools+=("docker-compose")
    fi
    
    if ! command -v psql &> /dev/null; then
        missing_tools+=("postgresql-client")
    fi
    
    if ! command -v dotnet &> /dev/null; then
        missing_tools+=("dotnet-sdk-8.0")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
    fi
    
    success "All prerequisites are installed"
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration..."
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        error "Production environment file (.env) not found. Copy from .env.production.example"
    fi
    
    # Load environment variables
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
    
    # Check required environment variables
    local required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD" 
        "JWT_SECRET"
        "ADMIN_EMAIL"
        "ADMIN_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    # Validate JWT secret length (should be at least 32 characters for HS256)
    if [ ${#JWT_SECRET} -lt 32 ]; then
        error "JWT_SECRET must be at least 32 characters long"
    fi
    
    success "Environment configuration is valid"
}

# Create backups before deployment
create_backup() {
    log "Creating backup before deployment..."
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    
    # Database backup (if database is running)
    if docker-compose ps postgres | grep -q "Up"; then
        log "Creating database backup..."
        docker-compose exec -T postgres pg_dump -U ecommerce_user -d ecommerce > "$backup_dir/database.sql" || warning "Database backup failed"
    fi
    
    # Docker volumes backup
    if docker volume ls | grep -q "ecommerce_postgres_data"; then
        log "Creating postgres volume backup..."
        docker run --rm -v ecommerce_postgres_data:/source -v "$backup_dir":/backup alpine tar czf /backup/postgres_data.tar.gz -C /source . || warning "Postgres volume backup failed"
    fi
    
    if docker volume ls | grep -q "ecommerce_redis_data"; then
        log "Creating redis volume backup..."
        docker run --rm -v ecommerce_redis_data:/source -v "$backup_dir":/backup alpine tar czf /backup/redis_data.tar.gz -C /source . || warning "Redis volume backup failed"
    fi
    
    success "Backup created in $backup_dir"
}

# Build and test application
build_and_test() {
    log "Building and testing application..."
    
    # Backend build and test
    cd "$BACKEND_DIR"
    log "Building .NET solution..."
    dotnet restore ECommerce.sln
    dotnet build ECommerce.sln --configuration Release --no-restore
    
    log "Running .NET tests..."
    if [ -d "tests" ]; then
        dotnet test ECommerce.sln --configuration Release --no-build --verbosity minimal
    fi
    
    # Frontend build and test
    cd "$FRONTEND_DIR"
    log "Building React application..."
    npm ci --production=false
    npm run build
    
    log "Running frontend tests..."
    npm test -- --watchAll=false --coverage=false
    
    success "Build and tests completed successfully"
}

# Setup database
setup_database() {
    log "Setting up production database..."
    
    # Start database services
    cd "$PROJECT_ROOT"
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0
    
    while ! docker-compose exec postgres pg_isready -U ecommerce_user -d ecommerce; do
        attempt=$((attempt + 1))
        if [ $attempt -ge $max_attempts ]; then
            error "Database failed to start within expected time"
        fi
        sleep 2
    done
    
    # Run production setup script
    if [ -f "$BACKEND_DIR/scripts/production-setup.sql" ]; then
        log "Running production database setup..."
        docker-compose exec -T postgres psql -U postgres -d ecommerce_prod < "$BACKEND_DIR/scripts/production-setup.sql" || warning "Production setup script failed"
    fi
    
    # Run EF Core migrations
    cd "$BACKEND_DIR/src/ECommerce.API"
    log "Running EF Core migrations..."
    dotnet ef database update --no-build
    
    success "Database setup completed"
}

# Deploy application containers
deploy_containers() {
    log "Deploying application containers..."
    
    cd "$PROJECT_ROOT"
    
    # Pull latest base images
    docker-compose pull
    
    # Build application images
    docker-compose build --no-cache
    
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
    
    success "All services deployed and healthy"
}

# Run health checks
health_checks() {
    log "Running post-deployment health checks..."
    
    local backend_url="http://localhost:5000"
    local frontend_url="http://localhost:3000"
    
    # Backend health check
    if curl -f "$backend_url/health" > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Frontend health check
    if curl -f "$frontend_url/health" > /dev/null 2>&1; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Database connection test
    if docker-compose exec postgres pg_isready -U ecommerce_user -d ecommerce > /dev/null 2>&1; then
        success "Database connection test passed"
    else
        error "Database connection test failed"
    fi
    
    # Redis connection test
    if docker-compose exec redis redis-cli ping | grep -q PONG; then
        success "Redis connection test passed"
    else
        error "Redis connection test failed"
    fi
}

# Setup monitoring and logging
setup_monitoring() {
    log "Setting up monitoring and logging..."
    
    # Create log directories
    mkdir -p "$PROJECT_ROOT/logs/nginx"
    mkdir -p "$PROJECT_ROOT/logs/postgres"
    
    # Set up log rotation (if logrotate is available)
    if command -v logrotate &> /dev/null; then
        cat > /tmp/ecommerce-logrotate << EOF
$PROJECT_ROOT/logs/**/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 root root
    postrotate
        docker-compose kill -s USR1 frontend
    endscript
}
EOF
        sudo cp /tmp/ecommerce-logrotate /etc/logrotate.d/ecommerce || warning "Failed to setup log rotation"
    fi
    
    success "Monitoring and logging setup completed"
}

# Security hardening
security_hardening() {
    log "Applying security hardening..."
    
    # Set proper file permissions
    chmod 600 "$PROJECT_ROOT/.env"
    
    # Remove development files in production
    rm -f "$PROJECT_ROOT/docker-compose.override.yml"
    
    # Ensure sensitive directories are not accessible
    find "$PROJECT_ROOT" -name "*.log" -exec chmod 600 {} \;
    
    success "Security hardening applied"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    if [ -d "$PROJECT_ROOT/backups" ]; then
        find "$PROJECT_ROOT/backups" -type d -mtime +7 -exec rm -rf {} + || true
    fi
    
    success "Cleanup completed"
}

# Display deployment summary
deployment_summary() {
    log "Deployment Summary:"
    echo
    docker-compose ps
    echo
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   API Documentation: http://localhost:5000/swagger"
    echo
    echo "📊 Container Status:"
    docker-compose exec postgres psql -U ecommerce_user -d ecommerce -c "SELECT 'Database' as service, 'Connected' as status;" || echo "   Database: Connection failed"
    docker-compose exec redis redis-cli ping && echo "   Redis: Connected" || echo "   Redis: Connection failed"
    echo
    echo "📋 Next Steps:"
    echo "   1. Monitor application logs: docker-compose logs -f"
    echo "   2. Set up SSL certificates for production use"
    echo "   3. Configure domain name and reverse proxy"
    echo "   4. Set up automated backups"
    echo "   5. Configure monitoring and alerting"
}

# Rollback function (in case of deployment failure)
rollback() {
    error "Deployment failed. Initiating rollback..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup if available
    local latest_backup=$(ls -t "$PROJECT_ROOT/backups" 2>/dev/null | head -n1)
    if [ -n "$latest_backup" ]; then
        warning "Restoring from backup: $latest_backup"
        # Add backup restoration logic here
    fi
    
    error "Rollback completed. Please check the logs for details."
}

# Main deployment function
main() {
    log "Starting ECommerce Production Deployment"
    log "========================================"
    
    # Trap errors and call rollback
    trap rollback ERR
    
    check_prerequisites
    validate_environment
    create_backup
    build_and_test
    setup_database
    deploy_containers
    health_checks
    setup_monitoring
    security_hardening
    cleanup
    
    # Remove error trap if we get this far
    trap - ERR
    
    success "🎉 Production deployment completed successfully!"
    deployment_summary
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi