-- Row Level Security (RLS) Policies for SMPL Save App
-- Run these commands AFTER creating the main schema

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
CREATE POLICY "Categories are publicly readable" ON categories
    FOR SELECT USING (true);

-- Services: Public read access
CREATE POLICY "Services are publicly readable" ON services
    FOR SELECT USING (true);

-- Users: Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- User Services: Users can only access their own service selections
CREATE POLICY "Users can view own service selections" ON user_services
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own service selections" ON user_services
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own service selections" ON user_services
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own service selections" ON user_services
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create a function to handle user creation via phone authentication
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, phone)
  VALUES (new.id, new.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger creation depends on your Supabase auth setup
-- You may need to create this trigger on auth.users if using Supabase Auth
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();