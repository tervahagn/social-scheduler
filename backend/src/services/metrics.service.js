import db from '../database/db.js';

export const MetricsService = {
    async saveMetrics(postId, metrics) {
        const {
            likes = 0, comments = 0, shares = 0,
            impressions = 0, reach = 0, clicks = 0,
            raw_data = {}
        } = metrics;

        // Calculate engagement rate: (likes + comments + shares) / impressions * 100
        let engagement_rate = 0;
        if (impressions > 0) {
            engagement_rate = ((likes + comments + shares) / impressions) * 100;
        }

        const result = await db.prepare(`
            INSERT INTO post_metrics 
            (post_id, likes, comments, shares, impressions, reach, clicks, engagement_rate, raw_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(postId, likes, comments, shares, impressions, reach, clicks, engagement_rate, JSON.stringify(raw_data));

        return result;
    }
};
