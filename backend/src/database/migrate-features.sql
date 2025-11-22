-- Add scheduled posting and comments
ALTER TABLE posts ADD COLUMN scheduled_at DATETIME;
ALTER TABLE posts ADD COLUMN scheduled_comment TEXT;
ALTER TABLE posts ADD COLUMN comment_scheduled_at DATETIME;

-- Create settings table for global configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default master prompt
INSERT INTO settings (key, value) VALUES (
    'master_prompt',
    'You are an expert content creator. Your task is to transform the given brief into engaging social media content.

Core Principles:
- Maintain authenticity and brand voice
- Create value for the audience
- Drive engagement and action
- Adapt tone and style to the platform

Brief:
{{brief}}

---

Create compelling content following the platform-specific guidelines below.'
);

-- Add selected_platforms column to briefs to track which platforms were chosen
ALTER TABLE briefs ADD COLUMN selected_platforms TEXT;
