-- Migration: Add user_code column to users table
-- This adds the 7-digit user code system for human-readable user identification

-- Add user_code column to users table
ALTER TABLE users ADD COLUMN user_code TEXT;

-- Create unique index on user_code for fast lookups and uniqueness
CREATE UNIQUE INDEX idx_users_user_code ON users(user_code);

-- Add comment to document the column
COMMENT ON COLUMN users.user_code IS 'Human-readable 7-digit code in format ABC-1234 for group discount access';

-- Function to generate user codes (PostgreSQL function)
CREATE OR REPLACE FUNCTION generate_user_code() RETURNS TEXT AS $$
DECLARE
    letters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ'; -- No I, O to avoid confusion
    numbers TEXT := '0123456789';
    result TEXT;
    letter_part TEXT := '';
    number_part TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 3 random letters
    FOR i IN 1..3 LOOP
        letter_part := letter_part || substr(letters, floor(random() * length(letters) + 1)::integer, 1);
    END LOOP;
    
    -- Generate 4 random numbers  
    FOR i IN 1..4 LOOP
        number_part := number_part || substr(numbers, floor(random() * length(numbers) + 1)::integer, 1);
    END LOOP;
    
    result := letter_part || '-' || number_part;
    
    -- Check if code already exists (very unlikely but good to be safe)
    WHILE EXISTS (SELECT 1 FROM users WHERE user_code = result) LOOP
        letter_part := '';
        number_part := '';
        
        FOR i IN 1..3 LOOP
            letter_part := letter_part || substr(letters, floor(random() * length(letters) + 1)::integer, 1);
        END LOOP;
        
        FOR i IN 1..4 LOOP
            number_part := number_part || substr(numbers, floor(random() * length(numbers) + 1)::integer, 1);
        END LOOP;
        
        result := letter_part || '-' || number_part;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with generated codes
UPDATE users 
SET user_code = generate_user_code() 
WHERE user_code IS NULL;

-- Make user_code NOT NULL after populating existing records
ALTER TABLE users ALTER COLUMN user_code SET NOT NULL;

-- Verification query to check the migration
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT user_code) as unique_codes,
    COUNT(CASE WHEN user_code ~ '^[A-Z]{3}-[0-9]{4}$' THEN 1 END) as valid_format_codes
FROM users;

-- Sample of generated codes
SELECT user_code, phone, created_at 
FROM users 
ORDER BY created_at 
LIMIT 5;