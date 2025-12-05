import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /api/history - Get unified history (posts from briefs + quick posts)
 * Query params: status, source, platform, limit, offset
 */
router.get('/', async (req, res) => {
    try {
        const { status, source, platform, limit = 50, offset = 0 } = req.query;

        // Build WHERE clauses
        let whereConditions = [];
        let params = [];

        // Query for posts from briefs
        let briefPostsQuery = `
            SELECT 
                p.id,
                p.content,
                p.edited_content,
                p.status,
                p.created_at,
                p.published_at,
                p.scheduled_at,
                pl.name as platform_name,
                pl.display_name as platform_display_name,
                b.title as brief_title,
                b.id as brief_id,
                'brief' as source
            FROM posts p
            JOIN platforms pl ON p.platform_id = pl.id
            JOIN briefs b ON p.brief_id = b.id
        `;

        // Query for quick posts
        let quickPostsQuery = `
            SELECT 
                qpi.id,
                qpi.content,
                qpi.content as edited_content,
                qpi.status,
                qp.created_at,
                qp.published_at,
                NULL as scheduled_at,
                pl.name as platform_name,
                pl.display_name as platform_display_name,
                qp.title as brief_title,
                qp.id as brief_id,
                'quick' as source
            FROM quick_post_items qpi
            JOIN quick_posts qp ON qpi.quick_post_id = qp.id
            JOIN platforms pl ON qpi.platform_id = pl.id
        `;

        // Apply filters
        let briefWhere = [];
        let quickWhere = [];

        if (status && status !== 'all') {
            briefWhere.push(`p.status = '${status}'`);
            quickWhere.push(`qpi.status = '${status}'`);
        }

        if (platform && platform !== 'all') {
            briefWhere.push(`pl.name = '${platform}'`);
            quickWhere.push(`pl.name = '${platform}'`);
        }

        if (briefWhere.length > 0) {
            briefPostsQuery += ` WHERE ${briefWhere.join(' AND ')}`;
        }
        if (quickWhere.length > 0) {
            quickPostsQuery += ` WHERE ${quickWhere.join(' AND ')}`;
        }

        // Combine queries based on source filter
        let combinedQuery;
        if (source === 'brief') {
            combinedQuery = briefPostsQuery;
        } else if (source === 'quick') {
            combinedQuery = quickPostsQuery;
        } else {
            combinedQuery = `${briefPostsQuery} UNION ALL ${quickPostsQuery}`;
        }

        // Add ordering and pagination
        const finalQuery = `
            SELECT * FROM (${combinedQuery}) 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;

        const posts = await db.prepare(finalQuery).all(parseInt(limit), parseInt(offset));

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM (${combinedQuery})`;
        const countResult = await db.prepare(countQuery).get();

        // Get status counts
        const statusCounts = await db.prepare(`
            SELECT status, COUNT(*) as count FROM (
                SELECT status FROM posts
                UNION ALL
                SELECT status FROM quick_post_items
            ) GROUP BY status
        `).all();

        res.json({
            posts,
            total: countResult.total,
            statusCounts: statusCounts.reduce((acc, s) => {
                acc[s.status] = s.count;
                return acc;
            }, {})
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
