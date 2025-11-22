import express from 'express';
import { publishAllPosts } from '../services/publisher.service.js';

const router = express.Router();

/**
 * POST /api/publish/brief/:briefId - Опубликовать все одобренные посты брифа
 */
router.post('/brief/:briefId', async (req, res) => {
    try {
        const results = await publishAllPosts(req.params.briefId);

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.json({
            message: `Published ${successful} posts, ${failed} failed`,
            results
        });
    } catch (error) {
        console.error('Error publishing posts:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
