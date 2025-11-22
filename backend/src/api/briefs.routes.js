import express from 'express';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from '../database/db.js';
import { generatePostsForBrief, getPostsForBrief } from '../services/content-generator.service.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = process.env.UPLOADS_DIR || './uploads';
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

/**
 * POST /api/briefs - Create a brief
 */
router.post('/', upload.single('media'), async (req, res) => {
    try {
        const { title, content, link_url, selected_platforms } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const mediaType = req.file ? req.file.mimetype : null;

        const result = await db.prepare(`
      INSERT INTO briefs (title, content, media_url, media_type, link_url, selected_platforms)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title || 'Untitled', content, mediaUrl, mediaType, link_url, selected_platforms);

        const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(result.lastInsertRowid);

        res.json(brief);
    } catch (error) {
        console.error('Error creating brief:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/briefs - Get all briefs
 */
router.get('/', async (req, res) => {
    try {
        const briefs = await db.prepare(`
      SELECT * FROM briefs 
      ORDER BY created_at DESC
    `).all();

        res.json(briefs);
    } catch (error) {
        console.error('Error fetching briefs:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/briefs/:id - Get brief by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(req.params.id);

        if (!brief) {
            return res.status(404).json({ error: 'Brief not found' });
        }

        res.json(brief);
    } catch (error) {
        console.error('Error fetching brief:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/briefs/:id/generate - Generate posts
 */
router.post('/:id/generate', async (req, res) => {
    try {
        const briefId = req.params.id;
        const posts = await generatePostsForBrief(briefId);

        res.json({
            message: `Generated ${posts.length} posts`,
            posts
        });
    } catch (error) {
        console.error('Error generating posts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/briefs/:id/posts - Get brief posts
 */
router.get('/:id/posts', async (req, res) => {
    try {
        const posts = await getPostsForBrief(req.params.id);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/briefs/:id - Delete brief
 */
router.delete('/:id', async (req, res) => {
    try {
        await db.prepare('DELETE FROM briefs WHERE id = ?').run(req.params.id);
        res.json({ message: 'Brief deleted' });
    } catch (error) {
        console.error('Error deleting brief:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
