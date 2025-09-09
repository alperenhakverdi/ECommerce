-- Production PostgreSQL Setup Script
-- This script prepares a PostgreSQL instance for production use

-- Set timezone to UTC for consistency
SET timezone = 'UTC';

-- Create database if it doesn't exist (run as superuser)
-- SELECT 'CREATE DATABASE ecommerce_prod' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_prod')\gexec

-- Connect to the production database
\c ecommerce_prod;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For better text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better indexing
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring

-- Create application user for the ECommerce API
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecommerce_api') THEN
        CREATE ROLE ecommerce_api LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
    END IF;
END
$$;

-- Create read-only user for reporting/analytics
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecommerce_readonly') THEN
        CREATE ROLE ecommerce_readonly LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
    END IF;
END
$$;

-- Grant appropriate permissions to application user
GRANT CONNECT ON DATABASE ecommerce_prod TO ecommerce_api;
GRANT USAGE ON SCHEMA public TO ecommerce_api;
GRANT CREATE ON SCHEMA public TO ecommerce_api;

-- Grant permissions to read-only user
GRANT CONNECT ON DATABASE ecommerce_prod TO ecommerce_readonly;
GRANT USAGE ON SCHEMA public TO ecommerce_readonly;

-- Performance and Security Settings (requires superuser privileges)
-- These should be applied by a DBA or during initial setup

-- Connection and authentication settings
-- ALTER SYSTEM SET max_connections = 200;
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Memory settings (adjust based on server specs)
-- ALTER SYSTEM SET shared_buffers = '2GB';        -- 25% of RAM
-- ALTER SYSTEM SET effective_cache_size = '6GB';   -- 75% of RAM
-- ALTER SYSTEM SET work_mem = '64MB';
-- ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- WAL and checkpoint settings
-- ALTER SYSTEM SET wal_buffers = '64MB';
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET max_wal_size = '4GB';
-- ALTER SYSTEM SET min_wal_size = '1GB';

-- Query planning settings
-- ALTER SYSTEM SET default_statistics_target = 100;
-- ALTER SYSTEM SET random_page_cost = 1.1;

-- Logging settings (important for production monitoring)
-- ALTER SYSTEM SET log_destination = 'stderr';
-- ALTER SYSTEM SET logging_collector = on;
-- ALTER SYSTEM SET log_directory = 'logs';
-- ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
-- ALTER SYSTEM SET log_rotation_size = '100MB';
-- ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log slow queries (>1s)
-- ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
-- ALTER SYSTEM SET log_statement = 'ddl';  -- Log DDL statements
-- ALTER SYSTEM SET log_lock_waits = on;

-- Security settings
-- ALTER SYSTEM SET ssl = on;
-- ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Reload configuration (requires superuser)
-- SELECT pg_reload_conf();

-- Create backup user (for automated backups)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecommerce_backup') THEN
        CREATE ROLE ecommerce_backup LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
    END IF;
END
$$;

-- Grant backup permissions
GRANT CONNECT ON DATABASE ecommerce_prod TO ecommerce_backup;
GRANT USAGE ON SCHEMA public TO ecommerce_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecommerce_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO ecommerce_backup;

-- Grant future table permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecommerce_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO ecommerce_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO ecommerce_readonly;

-- After EF Core migrations are run, grant appropriate permissions
-- This should be run after the .NET application has created all tables
/*
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ecommerce_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ecommerce_api;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecommerce_readonly;

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ecommerce_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ecommerce_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecommerce_readonly;
*/

-- Create indexes for better performance (run after EF migrations)
-- These complement the indexes created by EF Core

/*
-- Additional indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_price 
    ON "Products" ("CategoryId", "Price") WHERE "IsActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search_text 
    ON "Products" USING gin(to_tsvector('english', "Name" || ' ' || "Description")) 
    WHERE "IsActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_date 
    ON "Orders" ("UserId", "Status", "CreatedAt");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_user_product 
    ON "CartItems" ("UserId", "ProductId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
    ON "AspNetUsers" (lower("Email"));
*/

-- Create a view for order analytics (safe for read-only access)
/*
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
    DATE_TRUNC('day', o."CreatedAt") as order_date,
    o."Status",
    COUNT(*) as order_count,
    SUM(o."TotalAmount") as total_revenue,
    AVG(o."TotalAmount") as avg_order_value,
    COUNT(DISTINCT o."UserId") as unique_customers
FROM "Orders" o
WHERE o."CreatedAt" >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE_TRUNC('day', o."CreatedAt"), o."Status"
ORDER BY order_date DESC;

GRANT SELECT ON order_analytics TO ecommerce_readonly;
*/

-- Create monitoring views for database health
CREATE OR REPLACE VIEW database_health AS
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Total Connections' as metric,
    (SELECT count(*) FROM pg_stat_activity)::text as value
UNION ALL
SELECT 
    'Active Connections' as metric,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::text as value
UNION ALL
SELECT 
    'Cache Hit Ratio' as metric,
    CASE 
        WHEN (blks_hit + blks_read) = 0 THEN '0%'
        ELSE round((blks_hit::float / (blks_hit + blks_read)) * 100, 2)::text || '%'
    END as value
FROM pg_stat_database 
WHERE datname = current_database();

-- Grant access to monitoring view
GRANT SELECT ON database_health TO ecommerce_readonly;

-- Production data validation constraints
-- These will be created by EF Core, but we can add additional business constraints

/*
-- Ensure reasonable price ranges
ALTER TABLE "Products" ADD CONSTRAINT check_product_price_range 
    CHECK ("Price" >= 0.01 AND "Price" <= 1000000.00);

-- Ensure reasonable stock levels
ALTER TABLE "Products" ADD CONSTRAINT check_product_stock_range 
    CHECK ("Stock" >= 0 AND "Stock" <= 1000000);

-- Ensure order total makes sense
ALTER TABLE "Orders" ADD CONSTRAINT check_order_total_positive 
    CHECK ("TotalAmount" > 0);
*/

-- Create function to safely reset sequences (useful for data imports)
CREATE OR REPLACE FUNCTION reset_sequences() RETURNS void AS $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT schemaname, tablename, attname, seq.relname as seqname
        FROM pg_class seq
        JOIN pg_depend d ON d.objid = seq.oid
        JOIN pg_attribute a ON d.refobjid = a.attrelid AND d.refobjsubid = a.attnum
        JOIN pg_class t ON a.attrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE seq.relkind = 'S'
        AND n.nspname = 'public'
    LOOP
        EXECUTE format('SELECT setval(''%I.%I'', COALESCE(MAX(%I), 1)) FROM %I.%I', 
                      'public', rec.seqname, rec.attname, rec.schemaname, rec.tablename);
    END LOOP;
END $$ LANGUAGE plpgsql;

-- Function to get table sizes (useful for monitoring)
CREATE OR REPLACE FUNCTION get_table_sizes() 
RETURNS TABLE(table_name TEXT, size_pretty TEXT, size_bytes BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename))::TEXT,
        pg_total_relation_size(t.schemaname||'.'||t.tablename)
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;
END $$ LANGUAGE plpgsql;

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION get_table_sizes() TO ecommerce_readonly;

COMMIT;