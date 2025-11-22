import express from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { MetricsService } from '../services/metrics.service.js';

const router = express.Router();

/**
 * GET /api/analytics/dashboard
 * Returns aggregated data for the dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        const funnel = await AnalyticsService.getFunnelMetrics();
        const platforms = await AnalyticsService.getPlatformPerformance();
        const topPosts = await AnalyticsService.getTopPerformingPosts();

        res.json({ funnel, platforms, topPosts });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/analytics/posts/:id/metrics
 * Webhook endpoint to receive metrics from Make.com
 */
router.post('/posts/:id/metrics', async (req, res) => {
    try {
        const postId = req.params.id;
        const metrics = req.body;

        await MetricsService.saveMetrics(postId, metrics);
        res.json({ success: true });
    } catch (error) {
        console.error('Metrics Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
