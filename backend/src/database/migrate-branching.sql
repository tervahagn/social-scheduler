-- Migration: Add branching support to master_drafts
-- This enables creating alternative content versions from existing drafts

-- Add branching columns
ALTER TABLE master_drafts ADD COLUMN parent_id INTEGER REFERENCES master_drafts(id);
ALTER TABLE master_drafts ADD COLUMN branch_name TEXT;
ALTER TABLE master_drafts ADD COLUMN is_branch BOOLEAN DEFAULT 0;

-- Create index for parent lookups
CREATE INDEX IF NOT EXISTS idx_master_drafts_parent_id ON master_drafts(parent_id);
