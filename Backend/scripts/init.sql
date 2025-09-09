-- Initialize the database with proper settings
-- This script runs when PostgreSQL container starts for the first time

-- Set timezone
SET timezone = 'UTC';

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set connection limits and performance settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Create database user with necessary permissions (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecommerce_user') THEN
        -- User is already created by POSTGRES_USER environment variable
        -- Just ensure proper permissions
        GRANT CONNECT ON DATABASE ecommerce TO ecommerce_user;
        GRANT USAGE ON SCHEMA public TO ecommerce_user;
        GRANT CREATE ON SCHEMA public TO ecommerce_user;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecommerce_user;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecommerce_user;
        
        -- Grant permissions on future tables and sequences
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ecommerce_user;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ecommerce_user;
    END IF;
END
$$;