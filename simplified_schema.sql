-- Drop existing table
DROP TABLE IF EXISTS emails CASCADE;

-- Create the simplest possible emails table with no foreign keys
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  description TEXT,
  img_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE,
  seen_at TIMESTAMP WITH TIME ZONE
);

-- Create minimal index needed
CREATE INDEX emails_img_text_idx ON emails(img_text);

-- Grant basic permissions
GRANT SELECT, INSERT, UPDATE ON emails TO public;
GRANT USAGE, SELECT ON SEQUENCE emails_id_seq TO public;

-- INSTRUCTIONS FOR HASURA PERMISSIONS SETUP:
/*
This is a minimal setup with NO user_id field at all:

1. For ALL roles (user, anonymous):
   - INSERT permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL
     
   - SELECT permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL
     
   - UPDATE permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL

After this is working, you can tighten permissions later.
*/ 