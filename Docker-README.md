# ECommerce Application - Docker Deployment Guide

This guide explains how to deploy the ECommerce application using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB of available RAM
- At least 5GB of available disk space

## Quick Start

1. **Clone the repository and navigate to the project root**:
   ```bash
   cd /path/to/ECommerce
   ```

2. **Copy the environment file and configure it**:
   ```bash
   cp .env.production.example .env
   # Edit .env file with your production values
   ```

3. **Build and start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Check service status**:
   ```bash
   docker-compose ps
   ```

5. **View logs**:
   ```bash
   docker-compose logs -f
   ```

## Service Architecture

The application consists of the following services:

- **postgres**: PostgreSQL 15 database
- **redis**: Redis 7 cache server  
- **backend**: .NET 8 Web API
- **frontend**: React application with Nginx

## Service Details

### Database (PostgreSQL)
- **Port**: 5432
- **Database**: ecommerce
- **User**: ecommerce_user
- **Health Check**: Built-in pg_isready
- **Volume**: postgres_data (persistent storage)

### Cache (Redis)
- **Port**: 6379
- **Password Protected**: Yes (via REDIS_PASSWORD)
- **Persistence**: AOF enabled
- **Volume**: redis_data (persistent storage)

### Backend API (.NET 8)
- **Port**: 5000
- **Framework**: ASP.NET Core 8
- **Health Endpoint**: http://localhost:5000/health
- **Logs**: Stored in backend_logs volume
- **Features**:
  - JWT Authentication
  - Rate Limiting
  - Swagger Documentation
  - Health Checks
  - Caching with Redis
  - Database migrations (automatic)

### Frontend (React + Nginx)
- **Port**: 3000
- **Framework**: React 18 with TypeScript
- **Server**: Nginx (Alpine)
- **Features**:
  - Production optimized build
  - Gzip compression
  - Security headers
  - Client-side routing support
  - API proxy to backend

## Environment Configuration

### Required Environment Variables

Copy `.env.production.example` to `.env` and configure:

```bash
# Database
POSTGRES_PASSWORD=YourStrongPassword123!

# Redis
REDIS_PASSWORD=YourStrongRedisPassword123!

# JWT (must be 256+ bits)
JWT_SECRET=YourSuperSecretJwtKey...

# Admin Account
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongAdminPassword123!
```

### Optional Environment Variables

```bash
# Email (for notifications)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## Database Initialization

The PostgreSQL container automatically:
1. Creates the database and user
2. Installs required extensions (uuid-ossp, pg_trgm)
3. Sets performance configurations
4. Grants proper permissions

The .NET application runs EF Core migrations on startup.

## Security Features

### Container Security
- Non-root users in all containers
- Minimal base images (Alpine Linux)
- Health checks for all services
- Resource limits and restart policies

### Application Security
- JWT authentication with refresh tokens
- Password hashing (BCrypt)
- Rate limiting protection
- CORS configuration
- Security headers (CSP, HSTS, etc.)
- Input validation and sanitization

### Network Security
- Isolated Docker network
- Service-to-service communication only
- No direct database access from outside

## Monitoring and Health Checks

### Health Check Endpoints
- **Backend**: `http://localhost:5000/health`
- **Frontend**: `http://localhost:3000/health`
- **Database**: Built-in PostgreSQL health check
- **Redis**: Built-in Redis health check

### Log Management
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

## Production Deployment

### SSL/HTTPS Setup
1. Obtain SSL certificates
2. Update nginx.conf with SSL configuration
3. Set ASPNETCORE_Kestrel certificate settings
4. Use environment variables for certificate paths

### Performance Optimization
1. **Database**: Tune PostgreSQL settings in init.sql
2. **Redis**: Configure memory and persistence settings
3. **Backend**: Enable response compression and caching
4. **Frontend**: Nginx serves static files with caching headers

### Scaling Considerations
- Database: Use PostgreSQL connection pooling
- Backend: Run multiple instances behind a load balancer
- Frontend: Serve from CDN for static assets
- Cache: Use Redis Cluster for high availability

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U ecommerce_user -d ecommerce > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U ecommerce_user -d ecommerce < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v ecommerce_postgres_data:/source -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /source .
docker run --rm -v ecommerce_redis_data:/source -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz -C /source .
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Change ports in docker-compose.yml
   ports:
     - "5001:80"  # Instead of 5000:80
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database health
   docker-compose exec postgres pg_isready -U ecommerce_user -d ecommerce
   
   # Check connection string format
   # Host should be 'postgres' (service name), not 'localhost'
   ```

3. **Memory Issues**:
   ```bash
   # Increase Docker memory limit (Docker Desktop)
   # Or reduce service resource usage
   ```

4. **Permission Issues**:
   ```bash
   # Ensure proper file permissions
   chmod +x Backend/scripts/init.sql
   ```

### Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View service status
docker-compose ps

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec postgres psql -U ecommerce_user -d ecommerce

# Remove all data (DANGEROUS)
docker-compose down -v
```

## Development vs Production

### Development Setup
- Use `docker-compose.override.yml` for dev settings
- Mount source code as volumes for hot reload
- Use development certificates
- Enable debug logging

### Production Setup
- Use optimized build settings
- Enable SSL/HTTPS
- Configure proper logging levels
- Set up monitoring and alerting
- Use secrets management
- Regular security updates

## Updates and Maintenance

### Updating the Application
1. Pull latest code
2. Rebuild containers: `docker-compose build`
3. Restart services: `docker-compose up -d`
4. Check logs: `docker-compose logs -f`

### Security Updates
1. Regularly update base images
2. Update .NET and Node.js versions
3. Update PostgreSQL and Redis versions
4. Review and update dependencies

## Support

For issues and questions:
1. Check logs: `docker-compose logs`
2. Verify health checks: `docker-compose ps`
3. Review environment configuration
4. Check network connectivity between services