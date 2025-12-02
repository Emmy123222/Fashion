-- Enforce unique usernames to prevent duplicates
-- Run this in Supabase SQL Editor

-- The profiles table already has UNIQUE constraint on username
-- This script adds additional checks and a function to validate uniqueness

-- Create a function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(p_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE LOWER(username) = LOWER(p_username)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to suggest alternative usernames if taken
CREATE OR REPLACE FUNCTION suggest_username(p_base_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_counter INTEGER := 1;
  v_suggested_username TEXT;
BEGIN
  v_suggested_username := p_base_username;
  
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(v_suggested_username)) LOOP
    v_suggested_username := p_base_username || v_counter;
    v_counter := v_counter + 1;
    
    -- Prevent infinite loop
    IF v_counter > 9999 THEN
      v_suggested_username := p_base_username || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_suggested_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to ensure username is always lowercase for consistency
CREATE OR REPLACE FUNCTION normalize_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace and ensure not empty
  NEW.username := TRIM(NEW.username);
  
  IF NEW.username = '' THEN
    RAISE EXCEPTION 'Username cannot be empty';
  END IF;
  
  -- Check minimum length
  IF LENGTH(NEW.username) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters';
  END IF;
  
  -- Check maximum length
  IF LENGTH(NEW.username) > 30 THEN
    RAISE EXCEPTION 'Username must be at most 30 characters';
  END IF;
  
  -- Only allow alphanumeric, underscore, and hyphen
  IF NEW.username !~ '^[a-zA-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS normalize_username_trigger ON public.profiles;
CREATE TRIGGER normalize_username_trigger
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION normalize_username();

-- Add comment
COMMENT ON FUNCTION check_username_available(TEXT) IS 'Check if a username is available (case-insensitive)';
COMMENT ON FUNCTION suggest_username(TEXT) IS 'Suggest an available username based on the provided base username';
COMMENT ON FUNCTION normalize_username() IS 'Validate and normalize username before insert/update';
