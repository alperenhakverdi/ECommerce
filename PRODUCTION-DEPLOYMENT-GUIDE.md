# 🚀 ECommerce Production Deployment Guide

This guide covers the complete production deployment process for the ECommerce application, including database migration from SQLite to PostgreSQL.

## 📋 Pre-Deployment Checklist

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended) or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended
- **Network**: Stable internet connection

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL client (psql)
- .NET 8.0 SDK
- Node.js 18+
- Git

### Security Preparations
- [ ] SSL certificates obtained
- [ ] Domain name configured
- [ ] Firewall rules configured
- [ ] SSH keys set up
- [ ] Backup strategy planned

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd ECommerce
```

### 2. Configure Environment Variables
```bash
# Copy and customize environment file
cp .env.production.example .env

# Edit with your production values
nano .env
```

**Critical Environment Variables:**
```bash
# Database Configuration
POSTGRES_PASSWORD=YourStrongDatabasePassword123!

# Redis Configuration  
REDIS_PASSWORD=YourStrongRedisPassword123!

# JWT Configuration (must be 256+ bits)
JWT_SECRET=YourSuperSecretJwtKeyThatIsAtLeast256BitsLongAndRandomlyGenerated

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongAdminPassword123!

# SSL Configuration (optional)
ASPNETCORE_Kestrel__Certificates__Default__Password=YourCertPassword
ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx
```

### 3. Validate Configuration
```bash
# Run the deployment script with validation
./scripts/deploy-production.sh --validate-only
```

## 💾 Database Migration Strategy

### SQLite to PostgreSQL Migration

If migrating from an existing SQLite database:

#### Option 1: Automated Migration Script
```bash
# Create migration script
./scripts/migrate-sqlite-to-postgres.sh
```

#### Option 2: Manual Migration Process

1. **Export SQLite Data**
```bash
# Export data from SQLite
sqlite3 backend/src/ECommerce.API/ecommerce.db <<EOF
.headers on
.mode csv
.output users.csv
SELECT * FROM AspNetUsers;
.output products.csv
SELECT * FROM Products;
.output orders.csv
SELECT * FROM Orders;
.quit
EOF
```

2. **Import into PostgreSQL**
```bash
# After PostgreSQL is running and migrated
psql -h localhost -U ecommerce_user -d ecommerce_prod <<EOF
COPY "AspNetUsers" FROM '/path/to/users.csv' WITH CSV HEADER;
COPY "Products" FROM '/path/to/products.csv' WITH CSV HEADER;
COPY "Orders" FROM '/path/to/orders.csv' WITH CSV HEADER;
EOF
```

### Database Performance Optimization

After migration, run performance optimization:
```sql
-- Run in PostgreSQL
ANALYZE;
VACUUM ANALYZE;
REINDEX DATABASE ecommerce_prod;
```

## 🚀 Deployment Process

### 1. Automated Deployment (Recommended)
```bash
# Run the complete deployment script
./scripts/deploy-production.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Validate environment
- ✅ Create backups
- ✅ Build and test applications
- ✅ Set up PostgreSQL database
- ✅ Run EF Core migrations
- ✅ Deploy containers
- ✅ Run health checks
- ✅ Apply security hardening

### 2. Manual Deployment Steps

If you prefer manual control:

#### Step 1: Database Setup
```bash
# Start database services only
docker-compose up -d postgres redis

# Wait for services to be ready
docker-compose logs -f postgres

# Run production database setup
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE ecommerce_prod;"
docker-compose exec -T postgres psql -U postgres -d ecommerce_prod < Backend/scripts/production-setup.sql
```

#### Step 2: Run Database Migrations
```bash
cd Backend/src/ECommerce.API
dotnet ef database update --environment Production
```

#### Step 3: Build Applications
```bash
# Backend
cd Backend
dotnet restore ECommerce.sln
dotnet build ECommerce.sln --configuration Release

# Frontend
cd Frontend/ecommerce-frontend
npm ci
npm run build
```

#### Step 4: Deploy Containers
```bash
# Build and start all services
docker-compose build
docker-compose up -d
```

#### Step 5: Verify Deployment
```bash
# Check service health
docker-compose ps
curl http://localhost:5000/health
curl http://localhost:3000/health
```

## 🔒 Security Configuration

### SSL/HTTPS Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot certonly --standalone -d yourdomain.com

# Update docker-compose with certificate paths
```

#### Using Custom Certificates
```bash
# Copy certificates to the project
cp your-cert.pem Backend/certificates/
cp your-key.pem Backend/certificates/

# Update appsettings.Production.json with certificate settings
```

### Firewall Configuration
```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (adjust port as needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Security Headers and NGINX Configuration

Update `Frontend/ecommerce-frontend/nginx.conf` for production:
```nginx
# Add security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Enable SSL
listen 443 ssl http2;
ssl_certificate /path/to/your/certificate.pem;
ssl_certificate_key /path/to/your/private.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

## 📊 Monitoring and Maintenance

### Application Monitoring
```bash
# View real-time logs
docker-compose logs -f

# Check resource usage
docker stats

# Monitor database performance
docker-compose exec postgres psql -U ecommerce_user -d ecommerce_prod -c "SELECT * FROM database_health;"
```

### Health Check Endpoints
- **Backend API**: `http://localhost:5000/health`
- **Frontend**: `http://localhost:3000/health`
- **Database**: Available via API health check
- **Redis**: Available via API health check

### Backup Strategy

#### Automated Backups
```bash
# Set up daily backups (add to crontab)
0 2 * * * /path/to/ECommerce/scripts/backup-production.sh

# Weekly full backup
0 1 * * 0 /path/to/ECommerce/scripts/full-backup-production.sh
```

#### Manual Backup
```bash
# Database backup
docker-compose exec postgres pg_dump -U ecommerce_user -d ecommerce_prod > backup-$(date +%Y%m%d).sql

# Full application backup
docker run --rm -v ecommerce_postgres_data:/source -v $(pwd)/backups:/backup alpine tar czf /backup/postgres-$(date +%Y%m%d).tar.gz -C /source .
```

### Log Management
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/ecommerce

# View application logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔄 Updates and Rollbacks

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
docker-compose build
docker-compose up -d

# Run any new migrations
cd Backend/src/ECommerce.API
dotnet ef database update
```

### Rollback Procedure
```bash
# Stop current version
docker-compose down

# Restore from backup if needed
docker run --rm -v ecommerce_postgres_data:/target -v $(pwd)/backups:/source alpine tar xzf /source/postgres-backup.tar.gz -C /target

# Start previous version
git checkout <previous-commit>
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Problems
```bash
# Check database logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U ecommerce_user -d ecommerce_prod -c "SELECT 1;"

# Verify connection string
grep ConnectionStrings .env
```

#### Memory Issues
```bash
# Check available memory
free -h

# Adjust Docker memory limits in docker-compose.yml
# Add to services:
#   deploy:
#     resources:
#       limits:
#         memory: 512M
```

#### SSL Certificate Issues
```bash
# Verify certificate
openssl x509 -in certificate.pem -text -noout

# Check certificate expiration
openssl x509 -in certificate.pem -enddate -noout

# Renew Let's Encrypt certificates
sudo certbot renew
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor database performance
docker-compose exec postgres psql -U ecommerce_user -d ecommerce_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;"

# Check slow queries
docker-compose logs postgres | grep "duration:"
```

### Emergency Procedures

#### Service Recovery
```bash
# Restart specific service
docker-compose restart backend

# Full system restart
docker-compose restart

# Emergency stop
docker-compose down --remove-orphans
```

#### Data Recovery
```bash
# Restore from latest backup
./scripts/restore-backup.sh /path/to/backup

# Point-in-time recovery (if WAL archiving is enabled)
# This requires advanced PostgreSQL configuration
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Check logs for errors
- [ ] Weekly: Review security alerts
- [ ] Monthly: Update dependencies
- [ ] Monthly: Backup verification
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

### Monitoring Alerts
Set up alerts for:
- High memory/CPU usage
- Database connection failures
- Application errors (500+ responses)
- Disk space low
- SSL certificate expiration

### Contact Information
- **System Administrator**: [Your contact]
- **Database Administrator**: [DBA contact]
- **Development Team**: [Dev team contact]
- **Emergency Contact**: [Emergency contact]

---

## 🎯 Success Criteria

✅ **Deployment Complete When:**
- All services are running and healthy
- Health checks pass
- Database migrations applied
- SSL certificates configured
- Monitoring active
- Backups configured
- Documentation updated

✅ **Performance Targets:**
- API response time < 500ms (95th percentile)
- Frontend load time < 3 seconds
- Database queries < 100ms average
- 99.9% uptime

✅ **Security Checklist:**
- All services running as non-root users
- SSL/TLS enabled and properly configured
- Strong passwords and secrets
- Firewall properly configured
- Regular security updates applied
- Logging and monitoring active