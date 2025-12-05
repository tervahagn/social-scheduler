import express from 'express';
import { updatePostContent, approvePost } from '../services/content-generator.service.js';
import { publishPost, updatePostStatus, schedulePost } from '../services/publisher.service.js';
import { emitPostStatus, emitNotification } from '../services/socket.service.js';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /api/posts/:id - Get post
 */
router.get('/:id', async (req, res) => {
    try {
        const post = await db.prepare(`
      SELECT 
        posts.*,
        platforms.name as platform_name,
        platforms.display_name as platform_display_name
      FROM posts
      JOIN platforms ON posts.platform_id = platforms.id
      WHERE posts.id = ?
    `).get(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/posts/:id - Edit post
 */
router.put('/:id', async (req, res) => {
    try {
        const { edited_content, scheduled_at, scheduled_comment, comment_scheduled_at } = req.body;

        if (!edited_content && !scheduled_at && !scheduled_comment) {
            return res.status(400).json({ error: 'At least one field required' });
        }

        // Build update query
        const fields = [];
        const values = [];

        if (edited_content !== undefined) {
            fields.push('edited_content = ?');
            values.push(edited_content);
        }
        if (scheduled_at !== undefined) {
            fields.push('scheduled_at = ?');
            values.push(scheduled_at);
        }
        if (scheduled_comment !== undefined) {
            fields.push('scheduled_comment = ?');
            values.push(scheduled_comment);
        }
        if (comment_scheduled_at !== undefined) {
            fields.push('comment_scheduled_at = ?');
            values.push(comment_scheduled_at);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.id);

        await db.prepare(`
      UPDATE posts 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...values);

        const post = await db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
        res.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/posts/:id/approve - Approve post
 */
router.post('/:id/approve', async (req, res) => {
    try {
        const post = await approvePost(req.params.id);
        res.json(post);
    } catch (error) {
        console.error('Error approving post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/posts/:id/publish - Publish post
 */
router.post('/:id/publish', async (req, res) => {
    try {
        const result = await publishPost(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error publishing post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/posts/:id/schedule - Schedule post
 */
router.post('/:id/schedule', async (req, res) => {
    try {
        const { scheduled_at } = req.body;
        if (!scheduled_at) {
            return res.status(400).json({ error: 'Scheduled date is required' });
        }

        const result = await schedulePost(req.params.id, scheduled_at);
        res.json(result);
    } catch (error) {
        console.error('Error scheduling post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/posts/:id/status - Update post status (Callback from Make.com)
 * This endpoint is called by Make.com after publishing to social platforms
 */
router.post('/:id/status', async (req, res) => {
    try {
        const { status, link_url, error: errorMsg, platform } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const result = await updatePostStatus(req.params.id, status, link_url, errorMsg);

        // Emit WebSocket notification
        emitPostStatus(req.params.id, status, {
            platform,
            link_url,
            error: errorMsg
        });

        // Emit toast notification
        if (status === 'published') {
            emitNotification('success', `Post published to ${platform || 'platform'}`, {
                postId: req.params.id,
                link_url
            });
        } else if (status === 'failed') {
            emitNotification('error', `Failed to publish: ${errorMsg || 'Unknown error'}`, {
                postId: req.params.id
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
