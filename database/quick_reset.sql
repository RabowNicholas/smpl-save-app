-- Quick Reset Script for Supabase SQL Editor
-- Copy and paste this entire script into your Supabase SQL editor and run it

-- Fix users table schema (remove user_code if it exists)
ALTER TABLE users DROP COLUMN IF EXISTS user_code;

-- Clear existing data
DELETE FROM user_services;
DELETE FROM services;
DELETE FROM categories;

-- Insert new categories with UUID generation
INSERT INTO categories (name, icon, display_order) VALUES
('Phone Carriers', '📱', 1),
('Home Insurance', '🏠', 2),
('Auto Insurance', '🚗', 3),
('Renters Insurance', '🏢', 4),
('Internet', '🌐', 5);

-- Insert Phone Carriers
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Verizon', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/verizon.svg', id, true FROM categories WHERE name = 'Phone Carriers';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'AT&T', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/att.svg', id, true FROM categories WHERE name = 'Phone Carriers';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'T-Mobile', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tmobile.svg', id, true FROM categories WHERE name = 'Phone Carriers';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Sprint', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sprint.svg', id, false FROM categories WHERE name = 'Phone Carriers';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Mint Mobile', 'https://logo.clearbit.com/mintmobile.com', id, false FROM categories WHERE name = 'Phone Carriers';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Cricket', 'https://logo.clearbit.com/cricketwireless.com', id, false FROM categories WHERE name = 'Phone Carriers';

-- Insert Home Insurance
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'State Farm', 'https://logo.clearbit.com/statefarm.com', id, true FROM categories WHERE name = 'Home Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'GEICO', 'https://logo.clearbit.com/geico.com', id, true FROM categories WHERE name = 'Home Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Progressive', 'https://logo.clearbit.com/progressive.com', id, true FROM categories WHERE name = 'Home Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Allstate', 'https://logo.clearbit.com/allstate.com', id, true FROM categories WHERE name = 'Home Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Liberty Mutual', 'https://logo.clearbit.com/libertymutual.com', id, false FROM categories WHERE name = 'Home Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Farmers', 'https://logo.clearbit.com/farmers.com', id, false FROM categories WHERE name = 'Home Insurance';

-- Insert Auto Insurance
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'State Farm', 'https://logo.clearbit.com/statefarm.com', id, true FROM categories WHERE name = 'Auto Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'GEICO', 'https://logo.clearbit.com/geico.com', id, true FROM categories WHERE name = 'Auto Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Progressive', 'https://logo.clearbit.com/progressive.com', id, true FROM categories WHERE name = 'Auto Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Allstate', 'https://logo.clearbit.com/allstate.com', id, true FROM categories WHERE name = 'Auto Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Liberty Mutual', 'https://logo.clearbit.com/libertymutual.com', id, false FROM categories WHERE name = 'Auto Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Farmers', 'https://logo.clearbit.com/farmers.com', id, false FROM categories WHERE name = 'Auto Insurance';

-- Insert Renters Insurance
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Lemonade', 'https://logo.clearbit.com/lemonade.com', id, true FROM categories WHERE name = 'Renters Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'State Farm', 'https://logo.clearbit.com/statefarm.com', id, true FROM categories WHERE name = 'Renters Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'GEICO', 'https://logo.clearbit.com/geico.com', id, true FROM categories WHERE name = 'Renters Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Progressive', 'https://logo.clearbit.com/progressive.com', id, true FROM categories WHERE name = 'Renters Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Allstate', 'https://logo.clearbit.com/allstate.com', id, false FROM categories WHERE name = 'Renters Insurance';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Assurant', 'https://logo.clearbit.com/assurant.com', id, false FROM categories WHERE name = 'Renters Insurance';

-- Insert Internet Services
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Comcast Xfinity', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xfinity.svg', id, true FROM categories WHERE name = 'Internet';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Spectrum', 'https://logo.clearbit.com/spectrum.com', id, true FROM categories WHERE name = 'Internet';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Verizon Fios', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/verizon.svg', id, true FROM categories WHERE name = 'Internet';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'AT&T Internet', 'https://logo.clearbit.com/att.com', id, true FROM categories WHERE name = 'Internet';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Cox', 'https://logo.clearbit.com/cox.com', id, false FROM categories WHERE name = 'Internet';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'CenturyLink', 'https://logo.clearbit.com/centurylink.com', id, false FROM categories WHERE name = 'Internet';

-- Verify the results
SELECT
    c.name as category_name,
    c.icon,
    COUNT(s.id) as service_count
FROM categories c
LEFT JOIN services s ON c.id = s.category_id
GROUP BY c.id, c.name, c.icon, c.display_order
ORDER BY c.display_order;