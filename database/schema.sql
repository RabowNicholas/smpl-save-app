-- Service Mapping MVP Database Schema
-- This schema supports the core functionality of the service mapping application

-- Categories table for service groupings (Streaming, Groceries, etc.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(255),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table for individual services (Netflix, Walmart, etc.)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  logo_url VARCHAR(500),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table for phone-authenticated users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for user service selections
CREATE TABLE user_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Custom services table for user-created services
CREATE TABLE custom_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for user custom service selections
CREATE TABLE user_custom_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  custom_service_id UUID NOT NULL REFERENCES custom_services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, custom_service_id)
);

-- Indexes for performance
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_featured ON services(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_user_services_user_id ON user_services(user_id);
CREATE INDEX idx_user_services_service_id ON user_services(service_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_custom_services_user_id ON custom_services(user_id);
CREATE INDEX idx_custom_services_category_id ON custom_services(category_id);
CREATE INDEX idx_user_custom_services_user_id ON user_custom_services(user_id);
CREATE INDEX idx_user_custom_services_custom_service_id ON user_custom_services(custom_service_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for MVP categories
INSERT INTO categories (name, icon, display_order) VALUES
  ('Streaming & Entertainment', '🎬', 1),
  ('Groceries', '🛒', 2),
  ('Internet / Phone Provider', '📡', 3),
  ('Food Delivery', '🚚', 4),
  ('Transportation', '🚗', 5);

-- Seed data for popular services in each category
-- Streaming & Entertainment
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Netflix', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Disney+', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/disneyplus.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Hulu', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hulu.svg', id, FALSE 
FROM categories WHERE name = 'Streaming & Entertainment';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Amazon Prime Video', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazonprimevideo.svg', id, TRUE 
FROM categories WHERE name = 'Streaming & Entertainment';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'HBO Max', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/hbo.svg', id, FALSE 
FROM categories WHERE name = 'Streaming & Entertainment';

-- Groceries
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Walmart', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/walmart.svg', id, TRUE 
FROM categories WHERE name = 'Groceries';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Target', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/target.svg', id, TRUE 
FROM categories WHERE name = 'Groceries';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Amazon Fresh', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg', id, FALSE 
FROM categories WHERE name = 'Groceries';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Costco', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/costco.svg', id, TRUE 
FROM categories WHERE name = 'Groceries';

-- Internet / Phone Provider
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Verizon', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/verizon.svg', id, TRUE 
FROM categories WHERE name = 'Internet / Phone Provider';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'AT&T', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/att.svg', id, TRUE 
FROM categories WHERE name = 'Internet / Phone Provider';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'T-Mobile', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tmobile.svg', id, FALSE 
FROM categories WHERE name = 'Internet / Phone Provider';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Comcast Xfinity', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xfinity.svg', id, TRUE 
FROM categories WHERE name = 'Internet / Phone Provider';

-- Food Delivery
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'DoorDash', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/doordash.svg', id, TRUE 
FROM categories WHERE name = 'Food Delivery';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Uber Eats', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ubereats.svg', id, TRUE 
FROM categories WHERE name = 'Food Delivery';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Grubhub', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grubhub.svg', id, FALSE 
FROM categories WHERE name = 'Food Delivery';

-- Transportation
INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Uber', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/uber.svg', id, TRUE 
FROM categories WHERE name = 'Transportation';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Lyft', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/lyft.svg', id, TRUE 
FROM categories WHERE name = 'Transportation';

INSERT INTO services (name, logo_url, category_id, is_featured) 
SELECT 'Enterprise Rent-A-Car', 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/enterprise.svg', id, FALSE 
FROM categories WHERE name = 'Transportation';