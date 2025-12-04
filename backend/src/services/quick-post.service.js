import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { publishToWebhook } from './publisher.service.js';

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';
const db = new Database(dbPath);

// Character limits for validation
const CHAR_LIMITS = {
    'twitter': 280,
    'linkedin': 3000,
    'linkedin-personal': 3000,
    'instagram': 2200,
    'facebook': 63206, // Practical limit often lower
    'google-business': 1500,
    'youtube-posts': 500
};

export const quickPostService = {
    /**
     * Create a new quick post with items
     * @param {Object} data { title, items: [{ platform_id, content }] }
     */
    create: (data) => {
        const { title, items } = data;

        const transaction = db.transaction(() => {
            // Create main record
            const result = db.prepare('INSERT INTO quick_posts (title) VALUES (?)').run(title || 'Quick Post');
            const quickPostId = result.lastInsertRowid;

            // Create items
            const insertItem = db.prepare(`
                INSERT INTO quick_post_items (quick_post_id, platform_id, content, status)
                VALUES (?, ?, ?, 'pending')
            `);

            const createdItems = [];
            for (const item of items) {
                const itemResult = insertItem.run(quickPostId, item.platform_id, item.content);
                createdItems.push({
                    id: itemResult.lastInsertRowid,
                    ...item
                });
            }

            return { id: quickPostId, items: createdItems };
        });

        return transaction();
    },

    /**
     * Publish all items in a quick post
     */
    publish: async (quickPostId) => {
        // Get all pending items
        const items = db.prepare(`
            SELECT qpi.*, p.name as platform_name, p.display_name
            FROM quick_post_items qpi
            JOIN platforms p ON qpi.platform_id = p.id
            WHERE qpi.quick_post_id = ?
        `).all(quickPostId);

        const results = [];

        for (const item of items) {
            try {
                // Get attachments if any
                const files = db.prepare('SELECT * FROM quick_post_files WHERE quick_post_item_id = ?').all(item.id);

                // Prepare payload
                const payload = {
                    platform: item.platform_name,
                    content: item.content,
                    media: files.map(f => ({
                        path: f.file_path,
                        mimeType: f.mime_type,
                        originalName: f.original_name
                    })),
                    isQuickPost: true
                };

                // Send to webhook
                await publishToWebhook(payload);

                // Update status
                db.prepare(`
                    UPDATE quick_post_items 
                    SET status = 'published', published_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `).run(item.id);

                results.push({ id: item.id, status: 'published', platform: item.platform_name });

            } catch (error) {
                console.error(`Failed to publish quick post item ${item.id}:`, error);

                db.prepare(`
                    UPDATE quick_post_items 
                    SET status = 'failed', error_message = ? 
                    WHERE id = ?
                `).run(error.message, item.id);

                results.push({ id: item.id, status: 'failed', error: error.message, platform: item.platform_name });
            }
        }

        // Update main record status if all done
        db.prepare('UPDATE quick_posts SET published_at = CURRENT_TIMESTAMP WHERE id = ?').run(quickPostId);

        return results;
    },

    /**
     * Get history of quick posts
     */
    getHistory: () => {
        const posts = db.prepare(`
            SELECT * FROM quick_posts ORDER BY created_at DESC LIMIT 50
        `).all();

        return posts.map(post => {
            const items = db.prepare(`
                SELECT qpi.*, p.name as platform_name, p.display_name
                FROM quick_post_items qpi
                JOIN platforms p ON qpi.platform_id = p.id
                WHERE qpi.quick_post_id = ?
            `).all(post.id);

            return { ...post, items };
        });
    },

    /**
     * Upload file for a quick post item
     */
    uploadFile: (itemId, file) => {
        return db.prepare(`
            INSERT INTO quick_post_files (quick_post_item_id, file_path, original_name, mime_type)
            VALUES (?, ?, ?, ?)
        `).run(itemId, file.path, file.originalname, file.mimetype);
    },

    /**
     * Get character limit for platform
     */
    getLimit: (platformName) => {
        return CHAR_LIMITS[platformName] || 2000;
    }
};
