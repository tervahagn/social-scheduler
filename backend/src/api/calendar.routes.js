import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /api/calendar/all - Get all posts for calendar view (including quick posts)
 */
router.get('/all', async (req, res) => {
  try {
    // Get regular posts from briefs
    const briefPosts = await db.prepare(`
            SELECT 
                posts.id,
                posts.content,
                posts.edited_content,
                posts.status,
                posts.scheduled_at,
                posts.published_at,
                posts.created_at,
                platforms.name as platform_name,
                platforms.display_name as platform_display_name,
                briefs.title as brief_title,
                briefs.id as brief_id,
                'brief' as source
            FROM posts
            JOIN platforms ON posts.platform_id = platforms.id
            JOIN briefs ON posts.brief_id = briefs.id
            WHERE posts.scheduled_at IS NOT NULL OR posts.published_at IS NOT NULL
        `).all();

    // Get quick posts
    const quickPosts = await db.prepare(`
            SELECT 
                qpi.id,
                qpi.content,
                qpi.content as edited_content,
                qpi.status,
                NULL as scheduled_at,
                qp.published_at,
                qp.created_at,
                platforms.name as platform_name,
                platforms.display_name as platform_display_name,
                qp.title as brief_title,
                qp.id as brief_id,
                'quick' as source
            FROM quick_post_items qpi
            JOIN quick_posts qp ON qpi.quick_post_id = qp.id
            JOIN platforms ON qpi.platform_id = platforms.id
            WHERE qp.published_at IS NOT NULL
        `).all();

    // Combine and sort
    const allPosts = [...briefPosts, ...quickPosts].sort((a, b) => {
      const dateA = new Date(a.scheduled_at || a.published_at || a.created_at);
      const dateB = new Date(b.scheduled_at || b.published_at || b.created_at);
      return dateB - dateA;
    });

    res.json(allPosts);
  } catch (error) {
    console.error('Error fetching calendar posts:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
