import express from 'express';
import { publishAllPosts } from '../services/publisher.service.js';

const router = express.Router();

/**
 * POST /api/publish/brief/:briefId - Publish all approved posts of brief
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

/**
 * POST /api/publish/brief/:briefId/schedule - Schedule all approved posts of brief
 */
router.post('/brief/:briefId/schedule', async (req, res) => {
    try {
        const { scheduled_at } = req.body;

        if (!scheduled_at) {
            return res.status(400).json({ error: 'scheduled_at is required' });
        }

        const results = await publishAllPosts(req.params.briefId, scheduled_at);

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.json({
            message: `Scheduled ${successful} posts, ${failed} failed`,
            results
        });
    } catch (error) {
        console.error('Error scheduling posts:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
