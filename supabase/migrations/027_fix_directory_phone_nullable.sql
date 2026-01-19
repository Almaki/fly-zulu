-- Migration: Fix directory_entries phone column to be nullable
-- Description: Phone is optional, WhatsApp is the primary contact method
-- This fixes the "application error" when adding contacts without phone

-- Make phone nullable (WhatsApp is the primary contact)
ALTER TABLE directory_entries
  ALTER COLUMN phone DROP NOT NULL;

-- Ensure whatsapp has a proper constraint (it's the primary contact)
-- First, update any existing NULL whatsapp to empty string or keep as is
-- Then we might want to make it NOT NULL, but for backwards compatibility keep it optional

-- Add comment for documentation
COMMENT ON COLUMN directory_entries.phone IS 'Optional phone number';
COMMENT ON COLUMN directory_entries.whatsapp IS 'Primary contact method - WhatsApp number';
