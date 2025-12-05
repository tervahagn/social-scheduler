import db from '../database/db.js';
import axios from 'axios';

/**
 * Adds post to the publishing queue
 */
export async function queuePost(postId) {
    const result = await db.prepare(`
    INSERT INTO publish_queue (post_id, status, scheduled_at)
    VALUES (?, 'pending', CURRENT_TIMESTAMP)
  `).run(postId);

    return result.lastInsertRowid;
}

/**
 * Publishes post via Make.com webhook
 */
export async function publishPost(postId) {
    // Get webhook URL from settings (centralized for all platforms)
    const webhookSetting = await db.prepare(
        "SELECT value FROM settings WHERE key = 'make_webhook_url'"
    ).get();
    const webhookUrl = webhookSetting?.value;

    if (!webhookUrl) {
        throw new Error('Make.com webhook URL not configured. Please add it in Settings → Make.com Webhook Integration.');
    }

    // Get post with platform data
    const post = await db.prepare(`
    SELECT 
      posts.*,
      platforms.name as platform_name,
      platforms.display_name,
      briefs.media_url,
      briefs.media_type,
      briefs.link_url
    FROM posts
    JOIN platforms ON posts.platform_id = platforms.id
    JOIN briefs ON posts.brief_id = briefs.id
    WHERE posts.id = ?
  `).get(postId);

    if (!post) {
        throw new Error('Post not found');
    }

    // Use edited content if available, otherwise original
    const content = post.edited_content || post.content;

    // Format payload for Make.com
    const payload = {
        platform: post.platform_name,
        content: content,
        media_url: post.media_url || null,
        media_type: post.media_type || null,
        link_url: post.link_url || null,
        post_id: post.id,
        scheduled_at: post.scheduled_at || null,
        scheduled_comment: post.scheduled_comment || null,
        comment_scheduled_at: post.comment_scheduled_at || null,
        timestamp: new Date().toISOString()
    };

    try {
        // Send to Make.com using centralized webhook URL
        const response = await axios.post(webhookUrl, payload, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Update post status
        await db.prepare(`
      UPDATE posts 
      SET status = 'published', published_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(postId);

        // Update queue
        await db.prepare(`
      UPDATE publish_queue 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE post_id = ? AND status = 'pending'
    `).run(postId);

        console.log(`✅ Published to ${post.display_name}`);
        return { success: true, platform: post.display_name };
    } catch (error) {
        console.error(`❌ Failed to publish to ${post.display_name}:`, error.message);

        // Update queue with error
        const queue = await db.prepare(`
      SELECT * FROM publish_queue 
      WHERE post_id = ? AND status = 'pending'
      ORDER BY id DESC LIMIT 1
    `).get(postId);

        if (queue) {
            const attempts = queue.attempts + 1;
            const status = attempts >= queue.max_attempts ? 'failed' : 'pending';

            await db.prepare(`
        UPDATE publish_queue 
        SET attempts = ?, status = ?, last_error = ?
        WHERE id = ?
      `).run(attempts, status, error.message, queue.id);

            // Update post
            if (status === 'failed') {
                await db.prepare(`
          UPDATE posts 
          SET status = 'failed', error_message = ?, publish_error = ?
          WHERE id = ?
        `).run(error.message, error.message, postId);
            }
        }

        throw error;
    }
}

/**
 * Publishes all approved posts of a brief
 */
/**
 * Publishes all approved posts of a brief
 */
export async function publishAllPosts(briefId, scheduledAt = null) {
    const posts = await db.prepare('SELECT * FROM posts WHERE brief_id = ? AND status = ?').all(briefId, 'approved');

    if (posts.length === 0) {
        return [];
    }

    // Get webhook URL from settings (optional)
    const webhookSetting = await db.prepare("SELECT value FROM settings WHERE key = 'make_webhook_url'").get();
    const webhookUrl = webhookSetting?.value;

    const results = [];

    for (const post of posts) {
        try {
            // Determine status and timestamp based on scheduling
            const status = scheduledAt ? 'scheduled' : 'published';
            const timestampField = scheduledAt ? 'scheduled_at' : 'published_at';
            const timestampValue = scheduledAt || new Date().toISOString(); // Use provided time or current time

            // Update database
            await db.prepare(`
                UPDATE posts 
                SET status = ?, ${timestampField} = ?
                WHERE id = ?
            `).run(status, timestampValue, post.id);

            // If webhook configured, send data to Make.com / Zapier
            if (webhookUrl) {
                try {
                    // Get brief and platform details
                    const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(post.brief_id);
                    const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(post.platform_id);

                    // Send webhook
                    await axios.post(webhookUrl, {
                        post_id: post.id,
                        platform: platform?.id,
                        platform_name: platform?.display_name,
                        content: post.content,
                        brief: {
                            id: brief?.id,
                            title: brief?.title,
                            content: brief?.content,
                            link_url: brief?.link_url
                        },
                        scheduled_at: scheduledAt, // Will be null if publishing immediately
                        published_at: !scheduledAt ? new Date().toISOString() : null,
                        is_scheduled: !!scheduledAt,
                        timestamp: new Date().toISOString()
                    }, {
                        timeout: 10000, // 10 second timeout
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    results.push({
                        success: true,
                        post_id: post.id,
                        platform: platform?.display_name,
                        webhook_sent: true,
                        status: status
                    });
                } catch (webhookError) {
                    console.error(`Webhook error for post ${post.id}:`, webhookError.message);
                    // Mark as published/scheduled but note webhook error
                    await db.prepare(`
                        UPDATE posts 
                        SET publish_error = ? 
                        WHERE id = ?
                    `).run(`Webhook failed: ${webhookError.message}`, post.id);

                    results.push({
                        success: true, // Still updated locally
                        post_id: post.id,
                        platform: platform?.display_name,
                        webhook_sent: false,
                        webhook_error: webhookError.message,
                        status: status
                    });
                }
            } else {
                // No webhook configured - just mark as published/scheduled
                const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(post.platform_id);
                results.push({
                    success: true,
                    post_id: post.id,
                    platform: platform?.display_name,
                    webhook_sent: false,
                    status: status
                });
            }
        } catch (error) {
            console.error(`Error processing post ${post.id}:`, error);
            results.push({
                success: false,
                post_id: post.id,
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Schedules a single post
 */
export async function schedulePost(postId, scheduledAt) {
    const post = await db.prepare(`
        SELECT 
            posts.*,
            platforms.name as platform_name,
            platforms.display_name,
            briefs.media_url,
            briefs.media_type,
            briefs.link_url,
            briefs.title as brief_title,
            briefs.content as brief_content
        FROM posts
        JOIN platforms ON posts.platform_id = platforms.id
        JOIN briefs ON posts.brief_id = briefs.id
        WHERE posts.id = ?
    `).get(postId);

    if (!post) {
        throw new Error('Post not found');
    }

    // Update database
    await db.prepare(`
        UPDATE posts 
        SET status = 'scheduled', scheduled_at = ?
        WHERE id = ?
    `).run(scheduledAt, postId);

    // Get webhook URL
    const webhookSetting = await db.prepare("SELECT value FROM settings WHERE key = 'make_webhook_url'").get();
    const webhookUrl = webhookSetting?.value;

    if (webhookUrl) {
        try {
            // Send webhook
            await axios.post(webhookUrl, {
                post_id: post.id,
                platform: post.platform_id,
                platform_name: post.display_name,
                content: post.edited_content || post.content,
                brief: {
                    id: post.brief_id,
                    title: post.brief_title,
                    content: post.brief_content,
                    link_url: post.link_url
                },
                scheduled_at: scheduledAt,
                published_at: null,
                is_scheduled: true,
                timestamp: new Date().toISOString()
            }, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' }
            });

            return { success: true, platform: post.display_name, webhook_sent: true };
        } catch (webhookError) {
            console.error(`Webhook error for post ${post.id}:`, webhookError.message);
            // Note webhook error but keep scheduled status
            await db.prepare(`
                UPDATE posts 
                SET publish_error = ? 
                WHERE id = ?
            `).run(`Webhook failed: ${webhookError.message}`, post.id);

            return {
                success: true,
                platform: post.display_name,
                webhook_sent: false,
                webhook_error: webhookError.message
            };
        }
    }

    return { success: true, platform: post.display_name, webhook_sent: false };
}

/**
 * Retry failed publications
 */
export async function retryFailed() {
    const failedPosts = await db.prepare(`
    SELECT post_id FROM publish_queue 
    WHERE status = 'pending' AND attempts > 0
  `).all();

    for (const { post_id } of failedPosts) {
        try {
            await publishPost(post_id);
        } catch (error) {
            console.error(`Retry failed for post ${post_id}:`, error.message);
        }
    }
}

/**
 * Generic function to publish payload to the configured webhook
 */
export async function publishToWebhook(payload) {
    // Get webhook URL from settings
    const webhookSetting = await db.prepare(
        "SELECT value FROM settings WHERE key = 'make_webhook_url'"
    ).get();
    const webhookUrl = webhookSetting?.value;

    if (!webhookUrl) {
        throw new Error('Make.com webhook URL not configured. Please add it in Settings.');
    }

    // Send to Make.com
    await axios.post(webhookUrl, payload, {
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return true;
}

export default {
    queuePost,
    publishPost,
    publishAllPosts,
    retryFailed,
    publishToWebhook,
    updatePostStatus,
    schedulePost
};

/**
 * Updates post status from external callback (Make.com)
 */
export async function updatePostStatus(postId, status, linkUrl = null, errorMessage = null) {
    // Validate status
    const validStatuses = ['published', 'failed'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    if (status === 'published') {
        await db.prepare(`
            UPDATE posts 
            SET status = 'published', 
                published_at = CURRENT_TIMESTAMP,
                link_url = COALESCE(?, link_url),
                publish_error = NULL,
                error_message = NULL
            WHERE id = ?
        `).run(linkUrl, postId);

        console.log(`✅ Post ${postId} confirmed published via callback`);
    } else if (status === 'failed') {
        await db.prepare(`
            UPDATE posts 
            SET status = 'failed', 
                publish_error = ?,
                error_message = ?
            WHERE id = ?
        `).run(errorMessage || 'Unknown error from Make.com', errorMessage || 'Unknown error', postId);

        console.log(`❌ Post ${postId} reported failed via callback: ${errorMessage}`);
    }

    return { success: true, postId, status };
}
