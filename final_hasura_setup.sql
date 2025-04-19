-- Drop existing table
DROP TABLE IF EXISTS emails CASCADE;

-- Create a simple emails table without user relationship
-- This avoids foreign key and permission issues
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  description TEXT,
  img_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen_at TIMESTAMP WITH TIME ZONE,
  seen BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX emails_img_text_idx ON emails(img_text);
CREATE INDEX emails_created_at_idx ON emails(created_at);

-- Add comments for clarity
COMMENT ON TABLE emails IS 'Stores email tracking information without user relation';
COMMENT ON COLUMN emails.img_text IS 'Tracking ID included in email images';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON emails TO public;
GRANT USAGE, SELECT ON SEQUENCE emails_id_seq TO public;

-- INSTRUCTIONS FOR HASURA PERMISSIONS SETUP:
/*
After running this SQL, set up these permissions in Hasura console:

1. For "user" role:
   - INSERT permissions:
     * Row permission: {} (allow all)
     * Column permissions: email, description, img_text
     
   - SELECT permissions:
     * Row permission: {} (allow all)
     * Column permissions: all columns
     
   - UPDATE permissions:
     * Row permission: {} (allow all)
     * Column permissions: email, description

2. For "anonymous" role:
   - SELECT permissions:
     * Row permission: {"img_text": {"_is_null": false}}
     * Column permissions: id, img_text, seen
     
   - UPDATE permissions:
     * Row permission: {"img_text": {"_is_null": false}}
     * Column permissions: seen, seen_at
*/ 