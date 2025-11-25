import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /api/platforms - Get all platforms
 */
router.get('/', async (req, res) => {
    try {
        let platforms = await db.prepare('SELECT * FROM platforms').all();

        // Sort platforms in the preferred sequence
        const platformSequence = [
            'blog',
            'linkedin',
            'linkedin-personal',
            'reddit',
            'google-business',
            'twitter',
            'youtube-posts',
            'facebook',
            'instagram'
        ];

        platforms.sort((a, b) => {
            const indexA = platformSequence.indexOf(a.name);
            const indexB = platformSequence.indexOf(b.name);
            const valA = indexA === -1 ? 999 : indexA;
            const valB = indexB === -1 ? 999 : indexB;
            return valA - valB;
        });

        res.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/platforms/:id - Get platform
 */
router.get('/:id', async (req, res) => {
    try {
        const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(req.params.id);

        if (!platform) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        res.json(platform);
    } catch (error) {
        console.error('Error fetching platform:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/platforms - Add new platform
 */
router.post('/', async (req, res) => {
    try {
        const { name, display_name, webhook_url, prompt_file, is_active } = req.body;

        if (!name || !display_name || !prompt_file) {
            return res.status(400).json({ error: 'name, display_name, and prompt_file are required' });
        }

        const result = await db.prepare(`
      INSERT INTO platforms (name, display_name, webhook_url, prompt_file, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, display_name, webhook_url, prompt_file, is_active !== undefined ? is_active : 1);

        const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(result.lastInsertRowid);
        res.json(platform);
    } catch (error) {
        console.error('Error creating platform:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/platforms/:id - Update platform
 */
router.put('/:id', async (req, res) => {
    try {
        const { display_name, webhook_url, is_active, prompt_content } = req.body;

        await db.prepare(`
      UPDATE platforms 
      SET display_name = COALESCE(?, display_name),
          webhook_url = COALESCE(?, webhook_url),
          is_active = COALESCE(?, is_active),
          prompt_content = COALESCE(?, prompt_content)
      WHERE id = ?
    `).run(display_name, webhook_url, is_active, prompt_content, req.params.id);

        const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(req.params.id);
        res.json(platform);
    } catch (error) {
        console.error('Error updating platform:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/platforms/:id - Delete platform
 */
router.delete('/:id', async (req, res) => {
    try {
        await db.prepare('DELETE FROM platforms WHERE id = ?').run(req.params.id);
        res.json({ message: 'Platform deleted' });
    } catch (error) {
        console.error('Error deleting platform:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
