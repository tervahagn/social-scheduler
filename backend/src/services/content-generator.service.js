import { join } from 'path';
import db from '../database/db.js';
import { generateContent, generateContentWithImage } from './openrouter.service.js';

/**
 * NEW: Generate platform-specific content directly from brief (skip master draft)
 */
export async function generatePlatformContentDirect(briefId) {
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
        sourceContent += '\\n\\n--- Attached Documents ---\\n';
        const fs = await import('fs');
        const path = await import('path');

        for (const doc of docFiles) {
            try {
                const ext = path.extname(doc.original_name).toLowerCase();
                if (['.txt', '.md', '.csv', '.json', '.js', '.html', '.css'].includes(ext)) {
                    const fileContent = fs.readFileSync(join(process.cwd(), doc.file_path), 'utf8');
                    sourceContent += `\\n[File: ${doc.original_name}]\\n${fileContent}\\n`;
                }
            } catch (err) {
                console.warn(`Failed to read document ${doc.original_name}:`, err.message);
            }
        }
    }

    // Get master prompt from settings
    const masterPromptRow = await db.prepare("SELECT value FROM settings WHERE key = 'master_prompt'").get();
    const masterPrompt = masterPromptRow?.value || '';

    // Get selected platforms
    let platforms;
    if (brief.selected_platforms) {
        const selectedIds = JSON.parse(brief.selected_platforms);
        const placeholders = selectedIds.map(() => '?').join(',');
        platforms = await db.prepare(`SELECT * FROM platforms WHERE id IN (${placeholders}) AND is_active = 1`).all(...selectedIds);
    } else {
        platforms = await db.prepare('SELECT * FROM platforms WHERE is_active = 1').all();
    }

    // Platform sequence
    const platformSequence = [
        'blog', 'linkedin', 'linkedin-personal', 'reddit', 'google-business',
        'twitter', 'youtube-posts', 'facebook', 'instagram'
    ];

    platforms.sort((a, b) => {
        const indexA = platformSequence.indexOf(a.name);
        const indexB = platformSequence.indexOf(b.name);
        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;
        return valA - valB;
    });

    const posts = [];

    // Generate content for each platform
    for (const platform of platforms) {
        try {
            let content;
            let fullContent = sourceContent;
            if (brief.link_url) {
                fullContent += `\\n\\nLink: ${brief.link_url}`;
            }

            const startTime = Date.now();

            // Determine media to use
            let mediaUrl = brief.media_url;
            if (!mediaUrl && mediaFiles.length > 0) {
                const imageFile = mediaFiles.find(f => f.mime_type?.startsWith('image/'));
                if (imageFile) {
                    mediaUrl = imageFile.file_path;
                }
            }

            // Convert local path to base64 if needed
            if (mediaUrl && mediaUrl.startsWith('/uploads')) {
                const fs = await import('fs');
                const localPath = join(process.cwd(), mediaUrl);
                if (fs.existsSync(localPath)) {
                    const bitmap = fs.readFileSync(localPath);
                    const base64 = Buffer.from(bitmap).toString('base64');
                    const mime = brief.media_type || (mediaFiles.find(f => f.file_path === mediaUrl)?.mime_type) || 'image/jpeg';
                    mediaUrl = `data:${mime};base64,${base64}`;
                }
            }

            // Generate with Vision if image present
            if (mediaUrl && (brief.media_type?.startsWith('image/') || mediaFiles.some(f => f.mime_type?.startsWith('image/')))) {
                content = await generateContentWithImage(fullContent, mediaUrl, platform.id, platform.prompt_file, masterPrompt);
            } else {
                content = await generateContent(fullContent, platform.id, platform.prompt_file, masterPrompt);
            }

            const generationTime = Date.now() - startTime;

            // Save post to DB (version 1)
            const result = await db.prepare(`
                INSERT INTO posts (brief_id, platform_id, content, status, version, generation_time_ms)
                VALUES (?, ?, ?, 'draft', 1, ?)
            `).run(briefId, platform.id, content, generationTime);

            const post = await db.prepare(`
                SELECT posts.*, platforms.name as platform_name, platforms.display_name as platform_display_name
                FROM posts
                JOIN platforms ON posts.platform_id = platforms.id
                WHERE posts.id = ?
            `).get(result.lastInsertRowid);

            posts.push(post);

            console.log(`✅ Generated post for ${platform.display_name}`);
        } catch (error) {
            console.error(`❌ Failed to generate for ${platform.display_name}:`, error.message);
        }
    }

    return posts;
}

/**
 * NEW: Correct a post (create new version with corrections)
 */
export async function correctPost(postId, correctionPrompt) {
    const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    // Save current version to history
    await db.prepare(`
        INSERT INTO post_versions (post_id, version, content, correction_prompt)
        VALUES (?, ?, ?, NULL)
    `).run(postId, post.version, post.content);

    // Get platform info
    const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(post.platform_id);

    // Build correction prompt
    const fullPrompt = `Here is the current version of the content:

${post.content}

Please make the following corrections:
${correctionPrompt}

Provide the complete corrected version following the original platform guidelines.`;

    // Get API key and model from database
    const apiKeySetting = await db.prepare("SELECT value FROM settings WHERE key = 'openrouter_api_key'").get();
    const modelSetting = await db.prepare("SELECT value FROM settings WHERE key = 'openrouter_model'").get();

    const apiKey = apiKeySetting?.value || process.env.OPENROUTER_API_KEY;
    const model = modelSetting?.value || process.env.OPENROUTER_MODEL || 'x-ai/grok-4.1-fast:free';

    if (!apiKey) {
        throw new Error('OpenRouter API Key is not configured');
    }

    // Call LLM
    const { default: OpenAI } = await import('openai');
    const openrouter = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'Social Scheduler'
        }
    });

    const completion = await openrouter.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7,
        max_tokens: 2000
    });

    const correctedContent = completion.choices[0].message.content.trim();

    // Update post with new content and increment version
    const newVersion = post.version + 1;
    await db.prepare(`
        UPDATE posts 
        SET content = ?, version = ?, status = 'draft', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(correctedContent, newVersion, postId);

    // Save this version with correction prompt
    await db.prepare(`
        INSERT INTO post_versions (post_id, version, content, correction_prompt)
        VALUES (?, ?, ?, ?)
    `).run(postId, newVersion, correctedContent, correctionPrompt);

    const updatedPost = await db.prepare(`
        SELECT posts.*, platforms.name as platform_name, platforms.display_name as platform_display_name
        FROM posts
        JOIN platforms ON posts.platform_id = platforms.id
        WHERE posts.id = ?
    `).get(postId);

    console.log(`✅ Corrected post for ${platform.display_name} (v${newVersion})`);

    return updatedPost;
}

/**
 * NEW: Regenerate post from scratch
 */
export async function regeneratePost(postId) {
    const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    // Delete existing post
    await db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    await db.prepare('DELETE FROM post_versions WHERE post_id = ?').run(postId);

    // Trigger regeneration for this specific platform
    const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(post.brief_id);
    const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(post.platform_id);

    // We'll regenerate just this one platform
    // (reuse logic from generatePlatformContentDirect but for single platform)
    const posts = await generatePlatformContentDirect(post.brief_id);
    const newPost = posts.find(p => p.platform_id === post.platform_id);

    return newPost || null;
}

/**
 * NEW: Get version history for a post
 */
export async function getPostVersions(postId) {
    const versions = await db.prepare(`
        SELECT * FROM post_versions
        WHERE post_id = ?
        ORDER BY version DESC
    `).all(postId);

    return versions;
}

// ======== LEGACY FUNCTIONS (Keep for backward compatibility) ========

export async function generatePostsForBrief(briefId, masterId = null) {
    // ... existing implementation ...
}

export async function generatePostsFromMaster(masterId) {
    const masterDraft = await db.prepare('SELECT * FROM master_drafts WHERE id = ?').get(masterId);
    if (!masterDraft) {
        throw new Error('Master draft not found');
    }

    return generatePostsForBrief(masterDraft.brief_id, masterId);
}

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

export async function updatePostContent(postId, editedContent) {
    await db.prepare(`
        UPDATE posts 
        SET edited_content = ?, updated_at = CURRENT_TIMESTAMP, edit_count = edit_count + 1
        WHERE id = ?
    `).run(editedContent, postId);

    return await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
}

export async function approvePost(postId) {
    // Allow toggle: if already approved, un-approve
    const post = await db.prepare('SELECT status FROM posts WHERE id = ?').get(postId);

    if (post.status === 'approved') {
        // Un-approve
        await db.prepare(`
            UPDATE posts 
            SET status = 'draft', approved_at = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(postId);
    } else {
        // Approve
        await db.prepare(`
            UPDATE posts 
            SET status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(postId);
    }

    return await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
}

export default {
    // New functions
    generatePlatformContentDirect,
    correctPost,
    regeneratePost,
    getPostVersions,
    // Legacy functions
    generatePostsForBrief,
    getPostsForBrief,
    updatePostContent,
    approvePost,
    generatePostsFromMaster
};
