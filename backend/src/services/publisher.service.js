import db from '../database/db.js';
import axios from 'axios';

/**
 * Добавляет пост в очередь публикации
 */
export async function queuePost(postId) {
    const result = await db.prepare(`
    INSERT INTO publish_queue (post_id, status, scheduled_at)
    VALUES (?, 'pending', CURRENT_TIMESTAMP)
  `).run(postId);

    return result.lastInsertRowid;
}

/**
 * Публикует пост через Make.com webhook
 */
export async function publishPost(postId) {
    // Получаем пост с данными платформы
    const post = await db.prepare(`
    SELECT 
      posts.*,
      platforms.webhook_url,
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

    if (!post.webhook_url) {
        throw new Error(`Webhook URL not configured for ${post.display_name}`);
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
        // Отправляем на Make.com
        const response = await axios.post(post.webhook_url, payload, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Обновляем статус поста
        await db.prepare(`
      UPDATE posts 
      SET status = 'published', published_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(postId);

        // Обновляем очередь
        await db.prepare(`
      UPDATE publish_queue 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE post_id = ? AND status = 'pending'
    `).run(postId);

        console.log(`✅ Published to ${post.display_name}`);
        return { success: true, platform: post.display_name };
    } catch (error) {
        console.error(`❌ Failed to publish to ${post.display_name}:`, error.message);

        // Обновляем очередь с ошибкой
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

            // Обновляем пост
            if (status === 'failed') {
                await db.prepare(`
          UPDATE posts 
          SET status = 'failed', error_message = ?
          WHERE id = ?
        `).run(error.message, postId);
            }
        }

        throw error;
    }
}

/**
 * Публикует все одобренные посты брифа
 */
export async function publishAllPosts(briefId) {
    const posts = await db.prepare(`
    SELECT id FROM posts 
    WHERE brief_id = ? AND status = 'approved'
  `).all(briefId);

    const results = [];

    for (const post of posts) {
        try {
            const result = await publishPost(post.id);
            results.push({ postId: post.id, ...result });
        } catch (error) {
            results.push({ postId: post.id, success: false, error: error.message });
        }
    }

    return results;
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

export default {
    queuePost,
    publishPost,
    publishAllPosts,
    retryFailed
};
