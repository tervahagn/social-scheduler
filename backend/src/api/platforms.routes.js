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
        const platformId = req.params.id;

        // Build dynamic update query with only defined fields
        const updates = [];
        const values = [];

        if (display_name !== undefined) {
            updates.push('display_name = ?');
            values.push(display_name);
        }
        if (webhook_url !== undefined) {
            updates.push('webhook_url = ?');
            values.push(webhook_url);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active ? 1 : 0);
        }
        if (prompt_content !== undefined) {
            updates.push('prompt_content = ?');
            values.push(prompt_content);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(platformId);

        const sql = `UPDATE platforms SET ${updates.join(', ')} WHERE id = ?`;
        console.log(`[PUT /platforms/${platformId}] SQL:`, sql, 'Values:', values);

        await db.prepare(sql).run(...values);

        const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').get(platformId);

        if (!platform) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        console.log(`[PUT /platforms/${platformId}] Success: is_active=${platform.is_active}`);
        res.json(platform);
    } catch (error) {
        console.error('Error updating platform:', error);
        res.status(500).json({ error: error?.message || String(error) || 'Unknown error' });
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
