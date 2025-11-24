-- Add ultra_short_prompt column
ALTER TABLE platforms ADD COLUMN ultra_short_prompt TEXT;

-- Update existing platforms with default ultra-short prompts
UPDATE platforms SET ultra_short_prompt = 'Write a short, punchy professional update (max 2 sentences) for LinkedIn based on this brief.' WHERE name = 'linkedin';
UPDATE platforms SET ultra_short_prompt = 'Write a short, engaging Facebook update (max 2 sentences) based on this brief.' WHERE name = 'facebook';
UPDATE platforms SET ultra_short_prompt = 'Write a short, visual caption (max 2 sentences) for Instagram based on this brief.' WHERE name = 'instagram';
UPDATE platforms SET ultra_short_prompt = 'Write a short, catchy tweet (max 280 chars) based on this brief.' WHERE name = 'twitter';
UPDATE platforms SET ultra_short_prompt = 'Write a short business update (max 2 sentences) for Google Business based on this brief.' WHERE name = 'google-business';

-- Insert new platforms
INSERT INTO platforms (name, display_name, prompt_file, prompt_content, ultra_short_prompt) VALUES
('blog', 'Blog', 'blog.md', 'You are a professional blog writer. Create a blog post based on the following brief.

**Requirements:**
- SEO optimized with a catchy title
- Clear structure with Introduction, Body Paragraphs (use H2 headers), and Conclusion
- Professional yet engaging tone
- Minimum 500 words
- Include a Call to Action (CTA) at the end

**Brief:**
{{brief}}

---

Create a ready-to-publish blog post. Return ONLY the post text.', 'Write a short blog post outline (3-5 bullet points) based on this brief.'),

('reddit', 'Reddit', 'reddit.md', 'You are a regular Reddit user. Create a post for a relevant subreddit based on the following brief.

**Requirements:**
- Authentic, conversational, and "human" tone (avoid corporate speak)
- Encourage discussion and comments
- Use Markdown for formatting
- No hashtags
- If promoting something, be transparent and provide value first

**Brief:**
{{brief}}

---

Create a ready-to-publish Reddit post. Return ONLY the post text.', 'Write a short, provocative question or discussion starter for Reddit based on this brief.'),

('youtube-posts', 'YouTube Posts', 'youtube-posts.md', 'You are a YouTube creator engaging with your community. Create a YouTube Community Post based on the following brief.

**Requirements:**
- Casual and personal tone
- Encourage audience interaction (comments, likes, polls)
- Can use emojis
- Keep it relatively short and punchy (under 1000 characters)
- If mentioning a video, include a placeholder link

**Brief:**
{{brief}}

---

Create a ready-to-publish YouTube Community Post. Return ONLY the post text.', 'Write a quick, engaging update for YouTube Community (max 2 sentences) based on this brief.');
