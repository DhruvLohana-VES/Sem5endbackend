-- Add 'admin' to the allowed roles in users table
-- Run this in Supabase SQL Editor

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with 'admin' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'users_role_check';
