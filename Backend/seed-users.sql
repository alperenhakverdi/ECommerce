-- Update the store owner user to have StoreOwner role
-- First, create the StoreOwner role if it doesn't exist
INSERT OR IGNORE INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp) 
VALUES ('11111111-1111-1111-1111-111111111111', 'StoreOwner', 'STOREOWNER', '');

-- Find the store owner user ID (assuming storeowner@example.com is our store owner)
-- Add StoreOwner role to the store owner user
INSERT OR IGNORE INTO AspNetUserRoles (UserId, RoleId) 
VALUES (
    (SELECT Id FROM AspNetUsers WHERE Email = 'storeowner@example.com'),
    (SELECT Id FROM AspNetRoles WHERE Name = 'StoreOwner')
);

-- Also create Admin role and assign to admin user
INSERT OR IGNORE INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp) 
VALUES ('22222222-2222-2222-2222-222222222222', 'Admin', 'ADMIN', '');

INSERT OR IGNORE INTO AspNetUserRoles (UserId, RoleId) 
VALUES (
    (SELECT Id FROM AspNetUsers WHERE Email = 'admin@example.com'),
    (SELECT Id FROM AspNetRoles WHERE Name = 'Admin')
);