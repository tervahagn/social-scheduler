import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /api/posts/all - Get all posts for calendar view
 */
router.get('/all', async (req, res) => {
    try {
        const posts = await db.prepare(`
      SELECT 
        posts.*,
        platforms.name as platform_name,
        platforms.display_name as platform_display_name,
        briefs.title as brief_title
      FROM posts
      JOIN platforms ON posts.platform_id = platforms.id
      JOIN briefs ON posts.brief_id = briefs.id
      WHERE posts.scheduled_at IS NOT NULL OR posts.published_at IS NOT NULL
      ORDER BY COALESCE(posts.scheduled_at, posts.published_at) DESC
    `).all();

        res.json(posts);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
