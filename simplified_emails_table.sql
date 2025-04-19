-- Drop existing table
DROP TABLE IF EXISTS emails CASCADE;

-- Create the emails table with necessary fields
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  description TEXT,
  img_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE,
  seen_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX emails_img_text_idx ON emails(img_text);

-- Grant basic permissions
GRANT SELECT, INSERT, UPDATE ON emails TO public;
GRANT USAGE, SELECT ON SEQUENCE emails_id_seq TO public;

-- INSTRUCTIONS FOR HASURA PERMISSIONS SETUP:
/*
1. Go to Hasura Console > Data > emails table > Permissions tab

2. For both 'user' and 'anonymous' roles:
   - INSERT permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL
     
   - SELECT permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL
     
   - UPDATE permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL
*/ 