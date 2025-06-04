-- Add slug column to pets table (for adoption)
ALTER TABLE IF EXISTS pets
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to pets_lost table
ALTER TABLE IF EXISTS pets_lost
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to pets_found table
ALTER TABLE IF EXISTS pets_found
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to ongs table
ALTER TABLE IF EXISTS ongs
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to events table
ALTER TABLE IF EXISTS events
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to partners table
ALTER TABLE IF EXISTS partners
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index on slug columns for faster lookups
CREATE INDEX IF NOT EXISTS idx_pets_slug ON pets(slug);
CREATE INDEX IF NOT EXISTS idx_pets_lost_slug ON pets_lost(slug);
CREATE INDEX IF NOT EXISTS idx_pets_found_slug ON pets_found(slug);
CREATE INDEX IF NOT EXISTS idx_ongs_slug ON ongs(slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_partners_slug ON partners(slug);
