-- Migration: Add master_drafts table for iterative content workflow
-- This enables: Brief → Master-text → Correction (N times) → Approve → Platform posts

-- Create master_drafts table
CREATE TABLE IF NOT EXISTS master_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brief_id INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    correction_prompt TEXT,
    status TEXT DEFAULT 'draft', -- draft, approved
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_drafts_brief_id ON master_drafts(brief_id);
CREATE INDEX IF NOT EXISTS idx_master_drafts_status ON master_drafts(status);

-- Add master_draft_id reference to posts (optional, for tracking)
ALTER TABLE posts ADD COLUMN master_draft_id INTEGER REFERENCES master_drafts(id);
