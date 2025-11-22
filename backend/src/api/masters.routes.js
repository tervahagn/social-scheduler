import express from 'express';
import {
    generateMasterDraft,
    correctMasterDraft,
    approveMasterDraft,
    getMasterDrafts,
    getLatestMasterDraft
} from '../services/master-content.service.js';
import { generatePostsFromMaster } from '../services/content-generator.service.js';

const router = express.Router();

/**
 * GET /api/masters/brief/:briefId - Get all master drafts for a brief
 */
router.get('/brief/:briefId', async (req, res) => {
    try {
        const drafts = await getMasterDrafts(req.params.briefId);
        res.json(drafts);
    } catch (error) {
        console.error('Error fetching master drafts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/masters/brief/:briefId/latest - Get latest master draft
 */
router.get('/brief/:briefId/latest', async (req, res) => {
    try {
        const draft = await getLatestMasterDraft(req.params.briefId);
        if (!draft) {
            return res.status(404).json({ error: 'No master draft found' });
        }
        res.json(draft);
    } catch (error) {
        console.error('Error fetching latest master draft:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/masters/generate - Generate initial master draft
 */
router.post('/generate', async (req, res) => {
    try {
        const { briefId } = req.body;
        if (!briefId) {
            return res.status(400).json({ error: 'briefId is required' });
        }
        const draft = await generateMasterDraft(briefId);
        res.json(draft);
    } catch (error) {
        console.error('Error generating master draft:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/masters/:id/correct - Correct master draft
 */
router.post('/:id/correct', async (req, res) => {
    try {
        const { correctionPrompt } = req.body;
        if (!correctionPrompt) {
            return res.status(400).json({ error: 'correctionPrompt is required' });
        }
        const draft = await correctMasterDraft(req.params.id, correctionPrompt);
        res.json(draft);
    } catch (error) {
        console.error('Error correcting master draft:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/masters/:id/approve - Approve master draft
 */
router.post('/:id/approve', async (req, res) => {
    try {
        const draft = await approveMasterDraft(req.params.id);
        res.json(draft);
    } catch (error) {
        console.error('Error approving master draft:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/masters/:id/generate-posts - Generate platform posts from master
 */
router.post('/:id/generate-posts', async (req, res) => {
    try {
        const posts = await generatePostsFromMaster(req.params.id);
        res.json({
            message: `Generated ${posts.length} posts`,
            posts
        });
    } catch (error) {
        console.error('Error generating posts from master:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
