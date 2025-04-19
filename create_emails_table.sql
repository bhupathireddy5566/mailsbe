-- Drop existing table
DROP TABLE IF EXISTS emails CASCADE;

-- Create the emails table with necessary fields
CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- String type for user_id
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  img_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE,
  seen_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX emails_user_id_idx ON emails(user_id);
CREATE INDEX emails_img_text_idx ON emails(img_text);
CREATE INDEX emails_created_at_idx ON emails(created_at);

-- Grant basic permissions
GRANT SELECT, INSERT, UPDATE ON emails TO public;
GRANT USAGE, SELECT ON SEQUENCE emails_id_seq TO public;

-- INSTRUCTIONS FOR HASURA PERMISSIONS SETUP:
/*
1. Go to Hasura Console > Data > emails table > Permissions tab

2. For 'user' role:
   - INSERT permissions:
     * Row permission: {"user_id": {"_eq": "X-Hasura-User-Id"}}
     * Column permissions: ALL
     
   - SELECT permissions:
     * Row permission: {"user_id": {"_eq": "X-Hasura-User-Id"}}
     * Column permissions: ALL
     
   - UPDATE permissions:
     * Row permission: {"user_id": {"_eq": "X-Hasura-User-Id"}}
     * Column permissions: ALL

3. For 'anonymous' role:
   - INSERT permissions:
     * Row permission: {} (allow all)
     * Column permissions: ALL except user_id will be preset to "anonymous"
     
   - SELECT permissions:
     * Row permission: {} (allow all)
     * Column permissions: email, description, img_text, created_at, seen, seen_at
     
   - UPDATE permissions:
     * Row permission: {"img_text": {"_eq": "X-Hasura-Img-Text"}} (if tracking)
     * Column permissions: seen, seen_at
*/ 