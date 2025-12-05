-- Briefs: original newsmakers
CREATE TABLE IF NOT EXISTS briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    link_url TEXT,
    selected_platforms TEXT,
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
    prompt_content TEXT,
    ultra_short_prompt TEXT,
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
    scheduled_at DATETIME,
    scheduled_comment TEXT,
    comment_scheduled_at DATETIME,
    generation_time_ms INTEGER,
    edit_count INTEGER DEFAULT 0,
    approved_at DATETIME,
    publish_error TEXT,
    master_draft_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    link_url TEXT,
    FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
    FOREIGN KEY (master_draft_id) REFERENCES master_drafts(id)
);

-- Brief Files: multiple file uploads per brief
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

-- Master Drafts: iterative content workflow
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

-- Settings: global configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events: track user actions and system events
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    entity_id INTEGER,
    entity_type TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Post Metrics: social media performance data
CREATE TABLE IF NOT EXISTS post_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate REAL,
    raw_data JSON,
    FOREIGN KEY (post_id) REFERENCES posts(id)
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
CREATE INDEX IF NOT EXISTS idx_brief_files_brief_id ON brief_files(brief_id);
CREATE INDEX IF NOT EXISTS idx_master_drafts_brief_id ON master_drafts(brief_id);
CREATE INDEX IF NOT EXISTS idx_master_drafts_status ON master_drafts(status);
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_collected ON post_metrics(post_id, collected_at DESC);


-- Initial platforms with prompts
INSERT OR IGNORE INTO platforms (name, display_name, prompt_file, prompt_content, ultra_short_prompt) VALUES
-- LinkedIn Company
('linkedin', 'LinkedIn (Company)', 'linkedin.md', 
'You are a professional copywriter for LinkedIn. Create a post based on the following brief.

**Requirements:**
- Professional but lively tone (not corporate boredom)
- Maximum 3000 characters
- 3-5 relevant hashtags at the end of the post
- Structure: hook → main idea → call to action
- Use emojis moderately (1-3 per post)
- Formatting: use line breaks for readability

**Style:**
- Speak in first person
- Share insights and experience
- Ask questions to the audience
- Be specific, add examples

**Brief:**
{{brief}}

---

Create a ready-to-publish post for LinkedIn. Return ONLY the post text without additional comments.',
'Write a short, punchy professional update (max 2 sentences) for LinkedIn based on this brief.'),

-- LinkedIn Personal
('linkedin-personal', 'LinkedIn (Personal)', 'linkedin-personal.md', 
'You are a professional copywriter for LinkedIn. Create a personal post based on the following brief.

**Requirements:**
- Authentic, personal tone (first-person storytelling)
- Maximum 3000 characters
- 3-5 relevant hashtags at the end of the post
- Structure: personal hook → insight/lesson → call to action
- Use emojis sparingly (0-2 per post for authenticity)
- Formatting: use line breaks for readability

**Style:**
- Share personal experiences and learnings
- Be vulnerable and genuine
- Focus on individual growth and insights
- Use conversational language
- Encourage meaningful dialogue

**Brief:**
{{brief}}

---

Create a ready-to-publish personal post for LinkedIn. Return ONLY the post text without additional comments.',
'Write a short, personal insight (max 2 sentences) for LinkedIn based on this brief.'),

-- Facebook
('facebook', 'Facebook', 'facebook.md',
'You are a creative copywriter for Facebook. Create a post based on the following brief.

**Requirements:**
- Friendly, conversational tone
- Maximum 63206 characters (but practically up to 500-1000 for readability)
- Up to 5 hashtags (optional)
- Use emojis for emotional impact
- Call-to-action at the end

**Style:**
- Create emotional connection
- Tell stories
- Ask questions for engagement
- Be authentic

**Brief:**
{{brief}}

---

Create a ready-to-publish post for Facebook. Return ONLY the post text without additional comments.',
'Write a short, engaging Facebook update (max 2 sentences) based on this brief.'),

-- Instagram
('instagram', 'Instagram', 'instagram.md',
'You are a creative copywriter for Instagram. Create a caption for a post based on the following brief.

**Requirements:**
- Concise, visual style
- Maximum 2200 characters
- 10-15 relevant hashtags (as a separate block at the end)
- First line — strong hook (visible in feed)
- Emojis are welcome
- Line breaks for readability

**Style:**
- Be inspiring
- Create visual imagery with words
- Speak briefly but meaningfully
- Add a call to action: like, comment, save

**Brief:**
{{brief}}

---

Create a ready-to-publish caption for Instagram. Return ONLY the text without additional comments.',
'Write a short, visual caption (max 2 sentences) for Instagram based on this brief.'),

-- X (Twitter)
('twitter', 'X (Twitter)', 'twitter.md',
'You are a master of short, catchy tweets. Create a post for X (Twitter) based on the following brief.

**Requirements:**
- Maximum 280 characters
- Brevity and conciseness are key
- Up to 2 hashtags (if appropriate)
- Can use emojis
- Strong opening — first words are critical

**Style:**
- Speak directly and specifically
- Provoke thought or reaction
- Use metaphors and vivid phrasing
- Be bold

**Brief:**
{{brief}}

---

Create a ready-to-publish tweet. Return ONLY the tweet text without additional comments. CRITICAL: no more than 280 characters!',
'Write a short, catchy tweet (max 280 chars) based on this brief.'),

-- Google Business
('google-business', 'Google Business', 'google-business.md',
'You help create posts for Google Business Profile. Create a post based on the following brief.

**Requirements:**
- Maximum 1500 characters
- Focus on local business
- Call-to-action (call, visit, learn more)
- Simple, clear language
- Can use emojis

**Style:**
- Be informative
- Highlight benefits
- Create urgency or interest
- Focus on customer value

**Brief:**
{{brief}}

---

Create a ready-to-publish post for Google Business. Return ONLY the post text without additional comments.',
'Write a short business update (max 2 sentences) for Google Business based on this brief.'),

-- Blog
('blog', 'Blog', 'blog.md',
'You are a professional blog writer. Create a blog post based on the following brief.

**Requirements:**
- SEO optimized with a catchy title
- Clear structure with Introduction, Body Paragraphs (use H2 headers), and Conclusion
- Professional yet engaging tone
- Minimum 500 words
- Include a Call to Action (CTA) at the end

**Brief:**
{{brief}}

---

Create a ready-to-publish blog post. Return ONLY the post text.',
'Write a short blog post outline (3-5 bullet points) based on this brief.'),

-- Reddit
('reddit', 'Reddit', 'reddit.md',
'You are a regular Reddit user. Create a post for a relevant subreddit based on the following brief.

**Requirements:**
- Authentic, conversational, and "human" tone (avoid corporate speak)
- Encourage discussion and comments
- Use Markdown for formatting
- No hashtags
- If promoting something, be transparent and provide value first

**Brief:**
{{brief}}

---

Create a ready-to-publish Reddit post. Return ONLY the post text.',
'Write a short, provocative question or discussion starter for Reddit based on this brief.'),

-- YouTube Posts
('youtube-posts', 'YouTube Posts', 'youtube-posts.md',
'You are a YouTube creator engaging with your community. Create a YouTube Community Post based on the following brief.

**Requirements:**
- Casual and personal tone
- Encourage audience interaction (comments, likes, polls)
- Can use emojis
- Keep it relatively short and punchy (under 1000 characters)
- If mentioning a video, include a placeholder link

**Brief:**
{{brief}}

---

Create a ready-to-publish YouTube Community Post. Return ONLY the post text.',
'Write a quick, engaging update for YouTube Community (max 2 sentences) based on this brief.');

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES (
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

-- Quick Posts
CREATE TABLE IF NOT EXISTS quick_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
);

CREATE TABLE IF NOT EXISTS quick_post_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quick_post_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'pending', -- pending, published, failed, scheduled
    published_at DATETIME,
    scheduled_at DATETIME,
    error_message TEXT,
    FOREIGN KEY (quick_post_id) REFERENCES quick_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quick_post_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quick_post_item_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quick_post_item_id) REFERENCES quick_post_items(id) ON DELETE CASCADE
);
