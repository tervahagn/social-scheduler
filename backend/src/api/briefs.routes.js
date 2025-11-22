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
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit per file (checked individually in logic if needed, but multer checks this)
});

const uploadFields = upload.fields([
    { name: 'media', maxCount: 5 },
    { name: 'documents', maxCount: 5 }
]);

/**
 * POST /api/briefs - Create a brief
 */
router.post('/', uploadFields, async (req, res) => {
    try {
        const { title, content, link_url, selected_platforms } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Validate file counts and sizes manually if needed, though multer limits help.
        // We'll iterate over uploaded files to prepare for insertion.

        const mediaFiles = req.files['media'] || [];
        const docFiles = req.files['documents'] || [];

        // Check limits (redundant if multer handles it, but good for custom error messages)
        if (mediaFiles.length > 5) return res.status(400).json({ error: 'Too many media files (max 5)' });
        if (docFiles.length > 5) return res.status(400).json({ error: 'Too many document files (max 5)' });

        // Insert Brief
        // We still keep media_url/type for backward compatibility if a single media file is uploaded, 
        // or just leave them null and rely on brief_files. 
        // Let's populate them with the first media file for compatibility.
        const firstMedia = mediaFiles[0];
        const mediaUrl = firstMedia ? `/uploads/${firstMedia.filename}` : null;
        const mediaType = firstMedia ? firstMedia.mimetype : null;

        const result = await db.prepare(`
      INSERT INTO briefs (title, content, media_url, media_type, link_url, selected_platforms)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title || 'Untitled', content, mediaUrl, mediaType, link_url, selected_platforms);

        const briefId = result.lastInsertRowid;

        // Insert Files
        const insertFile = db.prepare(`
            INSERT INTO brief_files (brief_id, file_path, original_name, mime_type, file_size, category)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const file of mediaFiles) {
            await insertFile.run(briefId, `/uploads/${file.filename}`, file.originalname, file.mimetype, file.size, 'media');
        }

        for (const file of docFiles) {
            await insertFile.run(briefId, `/uploads/${file.filename}`, file.originalname, file.mimetype, file.size, 'document');
        }

        const brief = await db.prepare('SELECT * FROM briefs WHERE id = ?').get(briefId);

        // Fetch files to return with brief
        const files = await db.prepare('SELECT * FROM brief_files WHERE brief_id = ?').all(briefId);
        brief.files = files;

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

        const files = await db.prepare('SELECT * FROM brief_files WHERE brief_id = ?').all(req.params.id);
        brief.files = files;

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
