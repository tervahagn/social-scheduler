-- Migration: Add brief_files table for multiple file uploads
-- This enables storing multiple files (docs, media) for a single brief

CREATE TABLE IF NOT EXISTS brief_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brief_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    category TEXT NOT NULL, -- 'media' or 'document'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_brief_files_brief_id ON brief_files(brief_id);
