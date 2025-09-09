-- Development seed data for ECommerce application
-- This script runs after the main init.sql in development environment

-- Note: This data will be inserted after EF Core migrations run
-- So we need to handle potential conflicts gracefully

-- Insert sample categories (if they don't exist)
INSERT INTO "Categories" ("Id", "Name", "Description", "IsActive", "CreatedAt")
SELECT 
    gen_random_uuid(),
    'Electronics',
    'Electronic devices and gadgets',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Electronics');

INSERT INTO "Categories" ("Id", "Name", "Description", "IsActive", "CreatedAt")
SELECT 
    gen_random_uuid(),
    'Clothing',
    'Fashion and apparel',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Clothing');

INSERT INTO "Categories" ("Id", "Name", "Description", "IsActive", "CreatedAt")
SELECT 
    gen_random_uuid(),
    'Books',
    'Books and educational materials',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Categories" WHERE "Name" = 'Books');

-- Insert sample products (if they don't exist)
DO $$
DECLARE
    electronics_id UUID;
    clothing_id UUID;
    books_id UUID;
BEGIN
    -- Get category IDs
    SELECT "Id" INTO electronics_id FROM "Categories" WHERE "Name" = 'Electronics' LIMIT 1;
    SELECT "Id" INTO clothing_id FROM "Categories" WHERE "Name" = 'Clothing' LIMIT 1;
    SELECT "Id" INTO books_id FROM "Categories" WHERE "Name" = 'Books' LIMIT 1;
    
    -- Insert Electronics products
    IF electronics_id IS NOT NULL THEN
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'MacBook Pro 14"',
            'Apple MacBook Pro with M2 chip, 14-inch display, 16GB RAM, 512GB SSD',
            2499.99,
            15,
            electronics_id,
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'MacBook Pro 14"');
        
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'iPhone 15 Pro',
            'Latest iPhone with A17 Pro chip, 128GB storage, Pro camera system',
            1199.99,
            25,
            electronics_id,
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'iPhone 15 Pro');
        
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'Sony WH-1000XM5',
            'Premium noise-canceling wireless headphones',
            399.99,
            30,
            electronics_id,
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Sony WH-1000XM5');
    END IF;
    
    -- Insert Clothing products
    IF clothing_id IS NOT NULL THEN
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'Classic White T-Shirt',
            '100% cotton, comfortable fit, classic white t-shirt',
            29.99,
            100,
            clothing_id,
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Classic White T-Shirt');
        
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'Denim Jeans',
            'Classic blue denim jeans, slim fit, high quality material',
            79.99,
            50,
            clothing_id,
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Denim Jeans');
    END IF;
    
    -- Insert Books products
    IF books_id IS NOT NULL THEN
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'Clean Code',
            'A Handbook of Agile Software Craftsmanship by Robert C. Martin',
            42.99,
            25,
            books_id,
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Clean Code');
        
        INSERT INTO "Products" ("Id", "Name", "Description", "Price", "Stock", "CategoryId", "ImageUrl", "IsActive", "CreatedAt")
        SELECT 
            gen_random_uuid(),
            'Design Patterns',
            'Elements of Reusable Object-Oriented Software',
            54.99,
            20,
            books_id,
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
            true,
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "Products" WHERE "Name" = 'Design Patterns');
    END IF;
END $$;

-- Create a development admin user (if not exists)
-- Note: This will be handled by the application's admin seeding logic
-- But we can create a placeholder here for reference

-- Development test user (customer)
-- This will be created through the registration API in development
-- Password will be: TestUser123!

COMMIT;