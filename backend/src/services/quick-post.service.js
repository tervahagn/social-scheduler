import db from '../database/db.js';
import path from 'path';
import fs from 'fs';
import { publishToWebhook } from './publisher.service.js';
import { uploadToCloudinary } from './cloudinary.service.js';

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
    create: async (data) => {
        const { title, items } = data;

        // Create main record
        const result = await db.prepare('INSERT INTO quick_posts (title) VALUES (?)').run(title || 'Quick Post');
        const quickPostId = result.lastInsertRowid;

        // Create items
        const createdItems = [];
        for (const item of items) {
            const itemResult = await db.prepare(`
                INSERT INTO quick_post_items (quick_post_id, platform_id, content, title, status)
                VALUES (?, ?, ?, ?, 'pending')
            `).run(quickPostId, item.platform_id, item.content, item.title || null);
            createdItems.push({
                id: itemResult.lastInsertRowid,
                ...item
            });
        }

        return { id: quickPostId, items: createdItems };
    },

    /**
     * Publish all items in a quick post
     */
    publish: async (quickPostId) => {
        // Get all pending items
        const items = await db.prepare(`
            SELECT qpi.*, qpi.title, p.name as platform_name, p.display_name
            FROM quick_post_items qpi
            JOIN platforms p ON qpi.platform_id = p.id
            WHERE qpi.quick_post_id = ?
        `).all(quickPostId);

        const results = [];

        for (const item of items) {
            try {
                // Get attachments if any
                const files = await db.prepare('SELECT * FROM quick_post_files WHERE quick_post_item_id = ?').all(item.id);

                // Upload files to Cloudinary and get URLs
                const mediaWithUrls = [];
                for (const f of files) {
                    console.log(`📤 Uploading media to Cloudinary: ${f.file_path}`);
                    const cloudinaryUrl = await uploadToCloudinary(f.file_path);
                    mediaWithUrls.push({
                        url: cloudinaryUrl,
                        mimeType: f.mime_type,
                        originalName: f.original_name
                    });
                    console.log(`✅ Cloudinary URL: ${cloudinaryUrl}`);
                }

                // Format content for Reddit (double newlines for paragraphs)
                let formattedContent = item.content;
                if (item.platform_name === 'reddit') {
                    formattedContent = item.content.replace(/\n/g, '\n\n');
                }

                // Prepare payload with Cloudinary URLs
                const payload = {
                    platform: item.platform_name,
                    content: formattedContent,
                    brief_title: item.title || null, // For Reddit
                    media: mediaWithUrls,
                    media_url: mediaWithUrls.length > 0 ? mediaWithUrls[0].url : null,
                    isQuickPost: true
                };

                // Send to webhook
                await publishToWebhook(payload);

                // Update status to 'sent' (not 'published' - awaiting confirmation)
                await db.prepare(`
                    UPDATE quick_post_items 
                    SET status = 'sent' 
                    WHERE id = ?
                `).run(item.id);

                results.push({ id: item.id, status: 'sent', platform: item.platform_name });

            } catch (error) {
                console.error(`Failed to publish quick post item ${item.id}:`, error);

                await db.prepare(`
                    UPDATE quick_post_items 
                    SET status = 'failed', error_message = ? 
                    WHERE id = ?
                `).run(error.message, item.id);

                results.push({ id: item.id, status: 'failed', error: error.message, platform: item.platform_name });
            }
        }

        // Update main record status if all done
        await db.prepare('UPDATE quick_posts SET published_at = CURRENT_TIMESTAMP WHERE id = ?').run(quickPostId);

        return results;
    },

    /**
     * Schedule all items in a quick post for future publishing
     * @param {number} quickPostId - ID of the quick post
     * @param {string} scheduledAt - ISO date string for when to publish
     */
    schedule: async (quickPostId, scheduledAt) => {
        // Get all pending items
        const items = await db.prepare(`
            SELECT qpi.*, qpi.title, p.name as platform_name, p.display_name
            FROM quick_post_items qpi
            JOIN platforms p ON qpi.platform_id = p.id
            WHERE qpi.quick_post_id = ?
        `).all(quickPostId);

        const results = [];

        for (const item of items) {
            try {
                // Get attachments if any
                const files = await db.prepare('SELECT * FROM quick_post_files WHERE quick_post_item_id = ?').all(item.id);

                // Upload files to Cloudinary and get URLs
                const mediaWithUrls = [];
                for (const f of files) {
                    console.log(`📤 Uploading media to Cloudinary for scheduled post: ${f.file_path}`);
                    const cloudinaryUrl = await uploadToCloudinary(f.file_path);
                    mediaWithUrls.push({
                        url: cloudinaryUrl,
                        mimeType: f.mime_type,
                        originalName: f.original_name
                    });
                    console.log(`✅ Cloudinary URL: ${cloudinaryUrl}`);
                }

                // Format content for Reddit (double newlines for paragraphs)
                let formattedContent = item.content;
                if (item.platform_name === 'reddit') {
                    formattedContent = item.content.replace(/\n/g, '\n\n');
                }

                // Prepare payload with scheduled_at for Make.com to handle timing
                const payload = {
                    platform: item.platform_name,
                    content: formattedContent,
                    brief_title: item.title || null, // For Reddit
                    media: mediaWithUrls,
                    media_url: mediaWithUrls.length > 0 ? mediaWithUrls[0].url : null,
                    isQuickPost: true,
                    scheduled_at: scheduledAt // Make.com will use this to schedule the post
                };

                // Send to webhook (Make.com will handle the scheduling)
                await publishToWebhook(payload);

                // Update status
                await db.prepare(`
                    UPDATE quick_post_items 
                    SET status = 'scheduled', scheduled_at = ? 
                    WHERE id = ?
                `).run(scheduledAt, item.id);

                results.push({ id: item.id, status: 'scheduled', platform: item.platform_name, scheduled_at: scheduledAt });

            } catch (error) {
                console.error(`Failed to schedule quick post item ${item.id}:`, error);

                await db.prepare(`
                    UPDATE quick_post_items 
                    SET status = 'failed', error_message = ? 
                    WHERE id = ?
                `).run(error.message, item.id);

                results.push({ id: item.id, status: 'failed', error: error.message, platform: item.platform_name });
            }
        }

        // Update main record with scheduled time
        await db.prepare('UPDATE quick_posts SET scheduled_at = ? WHERE id = ?').run(scheduledAt, quickPostId);

        return results;
    },

    /**
     * Get history of quick posts
     */
    getHistory: async () => {
        const posts = await db.prepare(`
            SELECT * FROM quick_posts ORDER BY created_at DESC LIMIT 50
        `).all();

        const result = [];
        for (const post of posts) {
            const items = await db.prepare(`
                SELECT qpi.*, p.name as platform_name, p.display_name
                FROM quick_post_items qpi
                JOIN platforms p ON qpi.platform_id = p.id
                WHERE qpi.quick_post_id = ?
            `).all(post.id);

            result.push({ ...post, items });
        }

        return result;
    },

    /**
     * Upload file for a quick post item
     */
    uploadFile: async (itemId, file) => {
        return await db.prepare(`
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
