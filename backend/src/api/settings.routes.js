import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /api/settings/:key - Get setting by key
 */
router.get('/:key', async (req, res) => {
    try {
        const setting = await db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/settings/:key - Update setting
 */
router.put('/:key', async (req, res) => {
    try {
        const { value } = req.body;

        // Upsert setting
        await db.prepare(`
      INSERT INTO settings (key, value) 
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `).run(req.params.key, value);

        const setting = await db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);
        res.json(setting);
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
