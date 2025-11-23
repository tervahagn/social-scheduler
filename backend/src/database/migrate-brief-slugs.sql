-- Migration: Add slug field to briefs for human-readable URLs
-- Use date-time format (YYYYMMDD-HHMMSS) instead of numeric IDs in URLs

-- Add slug column (without UNIQUE constraint since SQLite doesn't support it in ALTER TABLE)
ALTER TABLE briefs ADD COLUMN slug TEXT;

-- Backfill existing briefs with slugs based on created_at
UPDATE briefs 
SET slug = strftime('%Y%m%d-%H%M%S', created_at) || '-' || id
WHERE slug IS NULL;

-- Create unique index for slug lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_briefs_slug ON briefs(slug);
