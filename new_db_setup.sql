-- Drop the existing emails table if it exists
DROP TABLE IF EXISTS emails CASCADE;

-- Create a fresh emails table with simplified schema
-- No user field to avoid any permission/relation issues
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  description TEXT,
  img_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen_at TIMESTAMP WITH TIME ZONE,
  seen BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX emails_created_at_idx ON emails(created_at);

-- Add comments for clarity
COMMENT ON TABLE emails IS 'Stores email tracking information without user relation';
COMMENT ON COLUMN emails.img_text IS 'Tracking ID included in email images';

-- Grant permissions for public operations
GRANT SELECT, INSERT, UPDATE ON emails TO public;
GRANT USAGE, SELECT ON SEQUENCE emails_id_seq TO public; 