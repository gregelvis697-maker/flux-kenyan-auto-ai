-- Add phone_number column to api.waitlist table
ALTER TABLE api.waitlist 
ADD COLUMN IF NOT EXISTS phone_number text CHECK (char_length(phone_number) >= 10 AND char_length(phone_number) <= 20);