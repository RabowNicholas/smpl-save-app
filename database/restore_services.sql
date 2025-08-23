-- Restore Services Data Script
-- This script safely clears and repopulates all categories and services
-- Matches the frontend SERVICE_VISUAL_MAP exactly with 22 services total

-- Begin transaction for safe execution
BEGIN;

-- Clear existing data (in correct order to avoid foreign key constraints)
DELETE FROM user_services;
DELETE FROM services;
DELETE FROM categories;

-- Insert categories with proper ordering and icons
INSERT INTO categories (name, icon, display_order) VALUES
  ('Streaming & Entertainment', '🎬', 1),
  ('Groceries', '🛒', 2),
  ('Internet / Phone Provider', '📡', 3),
  ('Food Delivery', '🚚', 4),
  ('Transportation', '🚗', 5);

-- =============================================
-- STREAMING & ENTERTAINMENT (8 services)
-- =============================================

-- Netflix (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Netflix', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- Disney+ (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Disney+', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/disneyplus.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- Hulu
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Hulu', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hulu.svg', id, FALSE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- Amazon Prime Video (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Amazon Prime Video', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazonprimevideo.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- HBO Max
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'HBO Max', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hbo.svg', id, FALSE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- Spotify (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Spotify', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- Apple Music
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Apple Music', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/applemusic.svg', id, FALSE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- YouTube Premium
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'YouTube Premium', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg', id, FALSE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- =============================================
-- GROCERIES (4 services)
-- =============================================

-- Walmart (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Walmart', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/walmart.svg', id, TRUE 
FROM categories WHERE name = 'Groceries';

-- Target (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Target', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/target.svg', id, TRUE 
FROM categories WHERE name = 'Groceries';

-- Amazon Fresh
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Amazon Fresh', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg', id, FALSE 
FROM categories WHERE name = 'Groceries';

-- Costco (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Costco', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/costco.svg', id, TRUE 
FROM categories WHERE name = 'Groceries';

-- =============================================
-- INTERNET / PHONE PROVIDER (4 services)
-- =============================================

-- Verizon (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Verizon', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/verizon.svg', id, TRUE 
FROM categories WHERE name = 'Internet / Phone Provider';

-- AT&T (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'AT&T', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/att.svg', id, TRUE 
FROM categories WHERE name = 'Internet / Phone Provider';

-- T-Mobile
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'T-Mobile', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tmobile.svg', id, FALSE 
FROM categories WHERE name = 'Internet / Phone Provider';

-- Comcast Xfinity (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Comcast Xfinity', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xfinity.svg', id, TRUE 
FROM categories WHERE name = 'Internet / Phone Provider';

-- =============================================
-- FOOD DELIVERY (3 services)
-- =============================================

-- DoorDash (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'DoorDash', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/doordash.svg', id, TRUE 
FROM categories WHERE name = 'Food Delivery';

-- Uber Eats (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Uber Eats', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ubereats.svg', id, TRUE 
FROM categories WHERE name = 'Food Delivery';

-- Grubhub
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Grubhub', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grubhub.svg', id, FALSE 
FROM categories WHERE name = 'Food Delivery';

-- =============================================
-- TRANSPORTATION (3 services)
-- =============================================

-- Uber (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Uber', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/uber.svg', id, TRUE 
FROM categories WHERE name = 'Transportation';

-- Lyft (Featured)
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Lyft', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/lyft.svg', id, TRUE 
FROM categories WHERE name = 'Transportation';

-- Enterprise Rent-A-Car
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Enterprise Rent-A-Car', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/enterprise.svg', id, FALSE 
FROM categories WHERE name = 'Transportation';

-- Commit the transaction
COMMIT;

-- Verify the results
SELECT 
  c.name AS category,
  c.icon,
  COUNT(s.id) AS service_count,
  COUNT(CASE WHEN s.is_featured THEN 1 END) AS featured_count
FROM categories c
LEFT JOIN services s ON c.id = s.category_id
GROUP BY c.id, c.name, c.icon, c.display_order
ORDER BY c.display_order;

-- Show total counts
SELECT 
  (SELECT COUNT(*) FROM categories) AS total_categories,
  (SELECT COUNT(*) FROM services) AS total_services,
  (SELECT COUNT(*) FROM services WHERE is_featured = TRUE) AS featured_services;