-- Briefs: original newsmakers
CREATE TABLE IF NOT EXISTS briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    link_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platforms: platform configuration
CREATE TABLE IF NOT EXISTS platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    webhook_url TEXT,
    prompt_file TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    config JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Posts: generated posts
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brief_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, approved, published, failed
    edited_content TEXT,
    published_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Publish Queue: publishing queue
CREATE TABLE IF NOT EXISTS publish_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_brief_id ON posts(brief_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform_id ON posts(platform_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_queue_status ON publish_queue(status);

-- Initial platforms
INSERT OR IGNORE INTO platforms (name, display_name, prompt_file) VALUES
    ('linkedin', 'LinkedIn', 'linkedin.md'),
    ('facebook', 'Facebook', 'facebook.md'),
    ('instagram', 'Instagram', 'instagram.md'),
    ('twitter', 'X (Twitter)', 'twitter.md'),
    ('google-business', 'Google Business', 'google-business.md');
