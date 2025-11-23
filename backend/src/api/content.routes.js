import express from 'express';
import db from '../database/db.js';
import { generatePlatformContentDirect, correctPost, regeneratePost, getPostVersions } from '../services/content-generator.service.js';

const router = express.Router();

/**
 * Helper: Get brief by ID or slug
 */
async function getBriefByIdOrSlug(identifier) {
    let brief = await db.prepare('SELECT * FROM briefs WHERE slug = ?').get(identifier);
    if (!brief && !isNaN(identifier)) {
        brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(parseInt(identifier));
    }
    return brief;
}

/**
 * POST /api/content/brief/:briefId/generate - Generate platform-specific content directly from brief
 * Accepts brief ID or slug
 */
router.post('/brief/:briefId/generate', async (req, res) => {
    try {
        const brief = await getBriefByIdOrSlug(req.params.briefId);
        if (!brief) {
            return res.status(404).json({ error: 'Brief not found' });
        }

        const posts = await generatePlatformContentDirect(brief.id);
        res.json(posts);
    } catch (error) {
        console.error('Error generating platform content:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/content/post/:postId/correct - Request corrections to a specific post
 */
router.post('/post/:postId/correct', async (req, res) => {
    try {
        const { correctionPrompt } = req.body;

        if (!correctionPrompt) {
            return res.status(400).json({ error: 'Correction prompt is required' });
        }

        const updatedPost = await correctPost(req.params.postId, correctionPrompt);
        res.json(updatedPost);
    } catch (error) {
        console.error('Error correcting post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/content/post/:postId/regenerate - Regenerate post from scratch
 */
router.post('/post/:postId/regenerate', async (req, res) => {
    try {
        const newPost = await regeneratePost(req.params.postId);
        res.json(newPost);
    } catch (error) {
        console.error('Error regenerating post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/content/post/:postId/versions - Get version history for a post
 */
router.get('/post/:postId/versions', async (req, res) => {
    try {
        const versions = await getPostVersions(req.params.postId);
        res.json(versions);
    } catch (error) {
        console.error('Error fetching post versions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/content/brief/:briefId/approve-all - Approve all posts for a brief
 * Accepts brief ID or slug
 */
router.post('/brief/:briefId/approve-all', async (req, res) => {
    try {
        const brief = await getBriefByIdOrSlug(req.params.briefId);
        if (!brief) {
            return res.status(404).json({ error: 'Brief not found' });
        }

        const posts = await db.prepare('SELECT * FROM posts WHERE brief_id = ? AND status = ?').all(brief.id, 'draft');

        const updateStmt = db.prepare('UPDATE posts SET status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?');

        for (const post of posts) {
            await updateStmt.run('approved', post.id);
        }

        const updatedPosts = await db.prepare('SELECT * FROM posts WHERE brief_id = ?').all(brief.id);
        res.json(updatedPosts);
    } catch (error) {
        console.error('Error approving all posts:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
