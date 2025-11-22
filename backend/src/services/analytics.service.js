import db from '../database/db.js';

export const AnalyticsService = {
    // 1. Funnel Metrics
    async getFunnelMetrics() {
        const totalBriefs = await db.prepare('SELECT COUNT(*) as count FROM briefs').get();
        const totalPosts = await db.prepare('SELECT COUNT(*) as count FROM posts').get();
        const approvedPosts = await db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'approved' OR status = 'published'").get();
        const publishedPosts = await db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").get();

        return {
            briefs: totalBriefs.count,
            generated: totalPosts.count,
            approved: approvedPosts.count,
            published: publishedPosts.count
        };
    },

    // 2. Platform Performance
    async getPlatformPerformance() {
        return await db.prepare(`
            SELECT 
                plat.display_name as platform,
                COUNT(*) as total_posts,
                AVG(p.edit_count) as avg_edits,
                AVG(p.generation_time_ms) as avg_gen_time,
                SUM(CASE WHEN p.status='published' THEN 1 ELSE 0 END) as published_count
            FROM posts p
            JOIN platforms plat ON p.platform_id = plat.id
            GROUP BY plat.id, plat.display_name
        `).all();
    },

    // 3. Engagement Metrics (Top Posts)
    async getTopPerformingPosts(limit = 5) {
        // Use a subquery to get the latest metrics for each post
        return await db.prepare(`
            SELECT 
                p.id, 
                plat.display_name as platform, 
                p.content, 
                pm.likes, pm.comments, pm.shares, pm.engagement_rate, pm.collected_at
            FROM posts p
            JOIN platforms plat ON p.platform_id = plat.id
            JOIN post_metrics pm ON p.id = pm.post_id
            WHERE pm.id = (
                SELECT MAX(id) FROM post_metrics WHERE post_id = p.id
            )
            ORDER BY pm.engagement_rate DESC
            LIMIT ?
        `).all(limit);
    },

    // 4. Recent Activity (Events)
    async getRecentEvents(limit = 10) {
        return await db.prepare(`
            SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT ?
        `).all(limit);
    }
};
