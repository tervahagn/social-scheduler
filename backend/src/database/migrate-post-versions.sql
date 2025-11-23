-- Migration: Add version support to posts for correction workflow
-- Part of simplified platform-first workflow (skip master draft)

-- Add version column to posts
ALTER TABLE posts ADD COLUMN version INTEGER DEFAULT 1;

-- Create post_versions table for correction history
CREATE TABLE IF NOT EXISTS post_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    correction_prompt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create index for efficient version queries
CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions(post_id, version DESC);
