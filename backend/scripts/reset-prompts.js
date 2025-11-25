import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../data/scheduler.db');

const db = new sqlite3.Database(dbPath);

const prompts = {
    master: `You are an expert content creator. Your goal is to adapt the given brief into engaging content tailored for specific social media platforms, maintaining brand voice and driving engagement.

Brief:
{{brief}}`,

    platforms: [
        {
            name: 'linkedin',
            prompt: `Create a professional LinkedIn post.

**Requirements:**
- Tone: Industry-leader, informative, professional but accessible.
- Structure: Hook -> Value/Insight -> Call to Action.
- Length: Max 3000 chars.
- Extras: 3-5 relevant hashtags at the bottom.

Return ONLY the post text.`
        },
        {
            name: 'linkedin-personal',
            prompt: `Create a personal LinkedIn post.

**Requirements:**
- Tone: Authentic, first-person, storytelling, vulnerable.
- Structure: Personal Hook -> Story/Lesson -> Question for audience.
- Length: Max 3000 chars.
- Extras: 3-5 hashtags.

Return ONLY the post text.`
        },
        {
            name: 'facebook',
            prompt: `Create a Facebook post.

**Requirements:**
- Tone: Friendly, community-focused, conversational.
- Structure: Engaging opening -> Story/Update -> Question/CTA.
- Length: Concise (under 1000 chars preferred).
- Extras: Use emojis to add warmth.

Return ONLY the post text.`
        },
        {
            name: 'instagram',
            prompt: `Create an Instagram caption.

**Requirements:**
- Tone: Visual, inspiring, lifestyle-focused.
- Structure: Strong Hook (first line) -> Context/Story -> CTA.
- Length: Max 2200 chars.
- Extras: Block of 10-15 hashtags at the very end.

Return ONLY the caption text.`
        },
        {
            name: 'twitter',
            prompt: `Create a Tweet (X post).

**Requirements:**
- Tone: Punchy, witty, direct.
- Structure: Single compelling idea or question.
- Length: STRICTLY under 280 characters.
- Extras: Max 1-2 hashtags.

Return ONLY the tweet text.`
        },
        {
            name: 'google-business',
            prompt: `Create a Google Business Profile update.

**Requirements:**
- Tone: Professional, local-business focused, clear.
- Structure: Update/Offer -> Benefits -> Clear CTA (Call, Visit, Book).
- Length: Max 1500 chars.

Return ONLY the post text.`
        },
        {
            name: 'blog',
            prompt: `Create a Blog Post.

**Requirements:**
- Tone: Informative, SEO-optimized, valuable.
- Structure: Catchy Title -> Introduction -> Body (with H2 headers) -> Conclusion -> CTA.
- Length: ~500 words.

Return ONLY the blog post text.`
        },
        {
            name: 'reddit',
            prompt: `Create a Reddit post.

**Requirements:**
- Tone: Authentic, 'redditor-to-redditor', discussion-based.
- Structure: Descriptive Title -> Body with context/question.
- No corporate speak. No hashtags.

Return ONLY the post text.`
        },
        {
            name: 'youtube-posts',
            prompt: `Create a YouTube Community Post.

**Requirements:**
- Tone: Casual, creator-to-fan.
- Structure: Update/Behind-the-scenes/Poll context -> Question.
- Length: Short (< 500 chars).

Return ONLY the post text.`
        }
    ]
};

console.log('Resetting prompts...');

db.serialize(() => {
    // Update Master Prompt
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('master_prompt', ?)", [prompts.master], (err) => {
        if (err) console.error('Error updating master prompt:', err);
        else console.log('✅ Master prompt updated');
    });

    // Update Platform Prompts
    const stmt = db.prepare("UPDATE platforms SET prompt_content = ? WHERE name = ?");

    prompts.platforms.forEach(p => {
        stmt.run(p.prompt, p.name, function (err) {
            if (err) console.error(`Error updating ${p.name}:`, err);
            else if (this.changes > 0) console.log(`✅ ${p.name} prompt updated`);
            else console.log(`⚠️ ${p.name} not found (skipped)`);
        });
    });

    stmt.finalize(() => {
        db.close();
        console.log('Done.');
    });
});
