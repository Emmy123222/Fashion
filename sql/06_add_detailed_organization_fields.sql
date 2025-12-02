-- Add detailed organization and location fields to profiles table
-- Run this in Supabase SQL Editor

-- Add new fields for detailed organization tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS high_school_name TEXT,
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_name TEXT,
ADD COLUMN IF NOT EXISTS corporation_name TEXT,
ADD COLUMN IF NOT EXISTS government_department TEXT,
ADD COLUMN IF NOT EXISTS organization_chapter TEXT;

-- Update organization_type to include more specific types
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_organization_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_organization_type_check 
CHECK (organization_type IN ('nonprofit', 'corporation', 'government', 'high_school', 'college', 'university'));

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_county ON public.profiles(county);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_high_school ON public.profiles(high_school_name);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college_name);
CREATE INDEX IF NOT EXISTS idx_profiles_nonprofit ON public.profiles(nonprofit_name);
CREATE INDEX IF NOT EXISTS idx_profiles_corporation ON public.profiles(corporation_name);
CREATE INDEX IF NOT EXISTS idx_profiles_government ON public.profiles(government_department);

-- Update leaderboards table to support new scopes
ALTER TABLE public.leaderboards 
DROP CONSTRAINT IF EXISTS leaderboards_scope_check;

ALTER TABLE public.leaderboards 
ADD CONSTRAINT leaderboards_scope_check 
CHECK (scope IN (
  'global', 
  'country', 
  'state', 
  'county', 
  'city', 
  'high_school', 
  'college',
  'university',
  'nonprofit', 
  'corporation', 
  'government',
  'organization_chapter'
));

-- Add comment explaining the schema
COMMENT ON COLUMN public.profiles.high_school_name IS 'Name of high school for high school students';
COMMENT ON COLUMN public.profiles.college_name IS 'Name of college/university for college students';
COMMENT ON COLUMN public.profiles.nonprofit_name IS 'Name of nonprofit organization';
COMMENT ON COLUMN public.profiles.corporation_name IS 'Name of corporation/company';
COMMENT ON COLUMN public.profiles.government_department IS 'Government department name (e.g., "Department of Education")';
COMMENT ON COLUMN public.profiles.organization_chapter IS 'Chapter or branch of organization (e.g., "San Francisco Chapter")';
