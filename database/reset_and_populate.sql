-- SMPL Save App - Database Reset and Population Script
-- This script will:
-- 1. Fix the users table schema by removing user_code column
-- 2. Clear all existing categories and services
-- 3. Populate with the new categories and services

-- Start transaction to ensure all changes are applied together
BEGIN;

-- ========================================
-- STEP 1: Fix Users Table Schema
-- ========================================

-- Check if user_code column exists and drop it if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_code'
    ) THEN
        ALTER TABLE users DROP COLUMN user_code;
        RAISE NOTICE 'Dropped user_code column from users table';
    ELSE
        RAISE NOTICE 'user_code column does not exist, no action needed';
    END IF;
END $$;

-- Ensure users table has the correct structure
-- Add any missing columns if needed
DO $$
BEGIN
    -- Check and add phone column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone TEXT UNIQUE NOT NULL;
        RAISE NOTICE 'Added phone column to users table';
    END IF;

    -- Check and add created_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to users table';
    END IF;

    -- Check and add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to users table';
    END IF;
END $$;

-- ========================================
-- STEP 2: Clear Existing Data
-- ========================================

-- Delete in the correct order to respect foreign key constraints
DELETE FROM user_services;
DELETE FROM services;
DELETE FROM categories;

RAISE NOTICE 'Cleared all existing categories, services, and user_services data';

-- ========================================
-- STEP 3: Insert New Categories
-- ========================================

INSERT INTO categories (id, name, icon, display_order, created_at, updated_at) VALUES
('phone-carriers', 'Phone Carriers', '📱', 1, NOW(), NOW()),
('home-insurance', 'Home Insurance', '🏠', 2, NOW(), NOW()),
('auto-insurance', 'Auto Insurance', '🚗', 3, NOW(), NOW()),
('renters-insurance', 'Renters Insurance', '🏢', 4, NOW(), NOW()),
('internet', 'Internet', '🌐', 5, NOW(), NOW());

RAISE NOTICE 'Inserted 5 new categories';

-- ========================================
-- STEP 4: Insert New Services
-- ========================================

-- Phone Carriers
INSERT INTO services (id, name, logo_url, category_id, is_featured, created_at, updated_at) VALUES
('verizon-mobile', 'Verizon', NULL, 'phone-carriers', true, NOW(), NOW()),
('att-mobile', 'AT&T', NULL, 'phone-carriers', true, NOW(), NOW()),
('t-mobile', 'T-Mobile', NULL, 'phone-carriers', true, NOW(), NOW()),
('sprint', 'Sprint', NULL, 'phone-carriers', false, NOW(), NOW()),
('mint-mobile', 'Mint Mobile', NULL, 'phone-carriers', false, NOW(), NOW()),
('cricket', 'Cricket', NULL, 'phone-carriers', false, NOW(), NOW());

-- Home Insurance
INSERT INTO services (id, name, logo_url, category_id, is_featured, created_at, updated_at) VALUES
('state-farm-home', 'State Farm', NULL, 'home-insurance', true, NOW(), NOW()),
('geico-home', 'GEICO', NULL, 'home-insurance', true, NOW(), NOW()),
('progressive-home', 'Progressive', NULL, 'home-insurance', true, NOW(), NOW()),
('allstate-home', 'Allstate', NULL, 'home-insurance', true, NOW(), NOW()),
('liberty-mutual-home', 'Liberty Mutual', NULL, 'home-insurance', false, NOW(), NOW()),
('farmers-home', 'Farmers', NULL, 'home-insurance', false, NOW(), NOW());

-- Auto Insurance
INSERT INTO services (id, name, logo_url, category_id, is_featured, created_at, updated_at) VALUES
('state-farm-auto', 'State Farm', NULL, 'auto-insurance', true, NOW(), NOW()),
('geico-auto', 'GEICO', NULL, 'auto-insurance', true, NOW(), NOW()),
('progressive-auto', 'Progressive', NULL, 'auto-insurance', true, NOW(), NOW()),
('allstate-auto', 'Allstate', NULL, 'auto-insurance', true, NOW(), NOW()),
('liberty-mutual-auto', 'Liberty Mutual', NULL, 'auto-insurance', false, NOW(), NOW()),
('farmers-auto', 'Farmers', NULL, 'auto-insurance', false, NOW(), NOW());

-- Renters Insurance
INSERT INTO services (id, name, logo_url, category_id, is_featured, created_at, updated_at) VALUES
('lemonade-renters', 'Lemonade', NULL, 'renters-insurance', true, NOW(), NOW()),
('state-farm-renters', 'State Farm', NULL, 'renters-insurance', true, NOW(), NOW()),
('geico-renters', 'GEICO', NULL, 'renters-insurance', true, NOW(), NOW()),
('progressive-renters', 'Progressive', NULL, 'renters-insurance', true, NOW(), NOW()),
('allstate-renters', 'Allstate', NULL, 'renters-insurance', false, NOW(), NOW()),
('assurant-renters', 'Assurant', NULL, 'renters-insurance', false, NOW(), NOW());

-- Internet Services
INSERT INTO services (id, name, logo_url, category_id, is_featured, created_at, updated_at) VALUES
('comcast-xfinity', 'Comcast Xfinity', NULL, 'internet', true, NOW(), NOW()),
('spectrum', 'Spectrum', NULL, 'internet', true, NOW(), NOW()),
('verizon-fios', 'Verizon Fios', NULL, 'internet', true, NOW(), NOW()),
('att-internet', 'AT&T Internet', NULL, 'internet', true, NOW(), NOW()),
('cox', 'Cox', NULL, 'internet', false, NOW(), NOW()),
('centurylink', 'CenturyLink', NULL, 'internet', false, NOW(), NOW());

RAISE NOTICE 'Inserted all new services:';
RAISE NOTICE '- Phone Carriers: 6 services';
RAISE NOTICE '- Home Insurance: 6 services'; 
RAISE NOTICE '- Auto Insurance: 6 services';
RAISE NOTICE '- Renters Insurance: 6 services';
RAISE NOTICE '- Internet: 6 services';
RAISE NOTICE 'Total: 30 services inserted';

-- ========================================
-- STEP 5: Verification
-- ========================================

-- Display summary of what was created
DO $$
DECLARE
    category_count INTEGER;
    service_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO service_count FROM services;
    
    RAISE NOTICE '====== DATABASE RESET COMPLETE ======';
    RAISE NOTICE 'Categories created: %', category_count;
    RAISE NOTICE 'Services created: %', service_count;
    RAISE NOTICE '=====================================';
END $$;

-- Show the created categories and service counts
SELECT 
    c.name as category_name,
    c.icon,
    COUNT(s.id) as service_count
FROM categories c
LEFT JOIN services s ON c.id = s.category_id
GROUP BY c.id, c.name, c.icon, c.display_order
ORDER BY c.display_order;

-- Commit all changes
COMMIT;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '🎉 Database successfully reset and populated with new categories and services!';
    RAISE NOTICE '📱 Ready for production use with insurance and telecom services';
END $$;