import { join } from 'path';
import db from '../database/db.js';
import { generateContent, generateContentWithImage } from './openrouter.service.js';

export async function generatePostsForBrief(briefId, masterId = null) {
    // Fetch brief data
    const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(briefId);
    if (!brief) {
        throw new Error('Brief not found');
    }
    // Get brief files
    const files = await db.prepare('SELECT * FROM brief_files WHERE brief_id = ?').all(briefId);
    const mediaFiles = files.filter(f => f.category === 'media');
    const docFiles = files.filter(f => f.category === 'document');


    // Prepare source content with attached documents
    let sourceContent = brief.content;

    // Append content from text-based documents
    if (docFiles.length > 0) {
        sourceContent += '\n\n--- Attached Documents ---\n';
        const fs = await import('fs');
        const path = await import('path');

        for (const doc of docFiles) {
            try {
                const ext = path.extname(doc.original_name).toLowerCase();
                // Basic text support for now
                if (['.txt', '.md', '.csv', '.json', '.js', '.html', '.css'].includes(ext)) {
                    const fileContent = fs.readFileSync(join(process.cwd(), doc.file_path), 'utf8');
                    sourceContent += `\n[File: ${doc.original_name}]\n${fileContent}\n`;
                } else {
                    sourceContent += `\n[File: ${doc.original_name}] (Content extraction not supported for ${ext} yet)\n`;
                }
            } catch (err) {
                console.warn(`Failed to read document ${doc.original_name}:`, err.message);
            }
        }
    }

    let masterPrompt = '';

    if (masterId) {
        const masterDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(masterId);
        if (!masterDraft) {
            throw new Error('Master draft not found');
        }
        // If master draft exists, use its content as the primary source, 
        // but we might still want to append document context if it wasn't already in the master draft?
        // For now, let's assume master draft content is the source of truth.
        sourceContent = masterDraft.content;
    } else {
        // Legacy flow: Get master prompt from settings
        const masterPromptRow = await db.prepare("SELECT value FROM settings WHERE key = 'master_prompt'").get();
        masterPrompt = masterPromptRow?.value || '';
    }

    // Get selected platforms or all active if none selected
    let platforms;
    if (brief.selected_platforms) {
        const selectedIds = JSON.parse(brief.selected_platforms);
        const placeholders = selectedIds.map(() => '?').join(',');
        platforms = await db.prepare(`SELECT * FROM platforms WHERE id IN (${placeholders}) AND is_active = 1`).all(...selectedIds);
    } else {
        platforms = await db.prepare('SELECT * FROM platforms WHERE is_active = 1').all();
    }

    // Define platform sequence: blog, linkedin (company), linkedin (personal), reddit, google, x, youtube, fb, ig
    const platformSequence = [
        'blog',
        'linkedin',
        'linkedin-personal',
        'reddit',
        'google-business',
        'twitter', // X
        'youtube-posts',
        'facebook',
        'instagram'
    ];

    // Sort platforms according to sequence
    platforms.sort((a, b) => {
        const indexA = platformSequence.indexOf(a.name);
        const indexB = platformSequence.indexOf(b.name);
        // If not in sequence, put at the end
        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;
        return valA - valB;
    });

    const posts = [];

    // Generate content for each platform
    for (const platform of platforms) {
        try {
            let content;

            // Format full brief/content
            let fullContent = sourceContent;
            if (brief.link_url) {
                fullContent += `\n\nLink: ${brief.link_url}`;
            }

            const startTime = Date.now();

            // Determine media to use (prefer brief.media_url for backward compat, then first media file)
            let mediaUrl = brief.media_url;
            if (!mediaUrl && mediaFiles.length > 0) {
                // Use the first image found
                const imageFile = mediaFiles.find(f => f.mime_type?.startsWith('image/'));
                if (imageFile) {
                    mediaUrl = imageFile.file_path; // This is relative path /uploads/...
                    // Ensure it's a full URL if needed by OpenRouter? 
                    // OpenRouter/OpenAI usually needs a public URL or base64. 
                    // Since we are local, we might need to convert to base64 if not public.
                    // But wait, generateContentWithImage takes a URL. 
                    // If it's a local file, we need to handle it.
                    // Let's check generateContentWithImage implementation.
                }
            }

            // Generate with Vision if image present
            if (mediaUrl && (brief.media_type?.startsWith('image/') || mediaFiles.some(f => f.mime_type?.startsWith('image/')))) {
                // We need to handle local file paths for OpenRouter if they are not public URLs.
                // Assuming generateContentWithImage might need update or we pass the path and it handles it?
                // The current implementation passes it directly to image_url.
                // If it's /uploads/..., it's a local path. OpenAI API won't reach it.
                // We should convert to base64 data URI.

                // Let's do a quick fix to convert local path to base64 if it starts with /uploads
                if (mediaUrl.startsWith('/uploads')) {
                    const fs = await import('fs');
                    const localPath = join(process.cwd(), mediaUrl);
                    if (fs.existsSync(localPath)) {
                        const bitmap = fs.readFileSync(localPath);
                        const base64 = Buffer.from(bitmap).toString('base64');
                        const mime = brief.media_type || (mediaFiles.find(f => f.file_path === mediaUrl)?.mime_type) || 'image/jpeg';
                        mediaUrl = `data:${mime};base64,${base64}`;
                    }
                }

                content = await generateContentWithImage(fullContent, mediaUrl, platform.id, platform.prompt_file, masterPrompt);
            } else {
                content = await generateContent(fullContent, platform.id, platform.prompt_file, masterPrompt);
            }

            const generationTime = Date.now() - startTime;

            // Save post to DB
            const result = await db.prepare(`
        INSERT INTO posts (brief_id, platform_id, content, status, master_draft_id, generation_time_ms)
        VALUES (?, ?, ?, 'draft', ?, ?)
      `).run(briefId, platform.id, content, masterId, generationTime);

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
 * Generates posts from a specific master draft
 */
export async function generatePostsFromMaster(masterId) {
    const masterDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(masterId);
    if (!masterDraft) {
        throw new Error('Master draft not found');
    }

    return generatePostsForBrief(masterDraft.brief_id, masterId);
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
    SET edited_content = ?, updated_at = CURRENT_TIMESTAMP, edit_count = edit_count + 1
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
    SET status = 'approved', updated_at = CURRENT_TIMESTAMP, approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(postId);

    return await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
}

export default {
    generatePostsForBrief,
    getPostsForBrief,
    updatePostContent,
    approvePost,
    generatePostsFromMaster
};
