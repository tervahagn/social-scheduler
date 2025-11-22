import db from '../database/db.js';
import { generateContent, generateContentWithImage } from './openrouter.service.js';

/**
 * Generates posts for all active platforms
 */
export async function generatePostsForBrief(briefId) {
    // Get brief
    const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(briefId);
    if (!brief) {
        throw new Error('Brief not found');
    }

    // Get master prompt from settings
    const masterPromptRow = await db.prepare("SELECT value FROM settings WHERE key = 'master_prompt'").get();
    const masterPrompt = masterPromptRow?.value || '';

    // Get selected platforms or all active if none selected
    let platforms;
    if (brief.selected_platforms) {
        const selectedIds = JSON.parse(brief.selected_platforms);
        const placeholders = selectedIds.map(() => '?').join(',');
        platforms = await db.prepare(`SELECT * FROM platforms WHERE id IN (${placeholders}) AND is_active = 1`).all(...selectedIds);
    } else {
        platforms = await db.prepare('SELECT * FROM platforms WHERE is_active = 1').all();
    }

    const posts = [];

    // Generate content for each platform
    for (const platform of platforms) {
        try {
            let content;

            // Format full brief
            let fullBrief = brief.content;
            if (brief.link_url) {
                fullBrief += `\n\nLink: ${brief.link_url}`;
            }

            // Generate with Vision if image present
            if (brief.media_url && brief.media_type?.startsWith('image/')) {
                content = await generateContentWithImage(fullBrief, brief.media_url, platform.id, platform.prompt_file, masterPrompt);
            } else {
                content = await generateContent(fullBrief, platform.id, platform.prompt_file, masterPrompt);
            }

            // Save post to DB
            const result = await db.prepare(`
        INSERT INTO posts (brief_id, platform_id, content, status)
        VALUES (?, ?, ?, 'draft')
      `).run(briefId, platform.id, content);

            posts.push({
                id: result.lastInsertRowid,
                platform: platform.display_name,
                content
            });

            console.log(`✅ Generated post for ${platform.display_name}`);
        } catch (error) {
            console.error(`❌ Failed to generate for ${platform.display_name}:`, error.message);
            // Continue with other platforms
        }
    }

    return posts;
}

/**
 * Gets all posts for brief
 */
export async function getPostsForBrief(briefId) {
    return await db.prepare(`
    SELECT 
      posts.*,
      platforms.name as platform_name,
      platforms.display_name as platform_display_name
    FROM posts
    JOIN platforms ON posts.platform_id = platforms.id
    WHERE posts.brief_id = ?
    ORDER BY platforms.name
  `).all(briefId);
}

/**
 * Updates post content (editing)
 */
export async function updatePostContent(postId, editedContent) {
    await db.prepare(`
    UPDATE posts 
    SET edited_content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(editedContent, postId);

    return await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
}

/**
 * Approves post
 */
export async function approvePost(postId) {
    await db.prepare(`
    UPDATE posts 
    SET status = 'approved', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(postId);

    return await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
}

export default {
    generatePostsForBrief,
    getPostsForBrief,
    updatePostContent,
    approvePost
};
