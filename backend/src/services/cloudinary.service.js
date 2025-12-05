/**
 * Cloudinary Service
 * Handles image upload to Cloudinary CDN for reliable media URLs
 */
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import db from '../database/db.js';

/**
 * Get Cloudinary credentials from database settings
 */
async function getCloudinaryConfig() {
    const cloudName = await db.prepare("SELECT value FROM settings WHERE key = 'cloudinary_cloud_name'").get();
    const apiKey = await db.prepare("SELECT value FROM settings WHERE key = 'cloudinary_api_key'").get();
    const apiSecret = await db.prepare("SELECT value FROM settings WHERE key = 'cloudinary_api_secret'").get();

    if (!cloudName?.value || !apiKey?.value || !apiSecret?.value) {
        return null;
    }

    return {
        cloud_name: cloudName.value,
        api_key: apiKey.value,
        api_secret: apiSecret.value
    };
}

/**
 * Upload a local file to Cloudinary
 * @param {string} localPath - Path to local file (e.g., '/uploads/image.jpg' or full path)
 * @returns {Promise<string|null>} - Cloudinary URL or null if upload fails/not configured
 */
export async function uploadToCloudinary(localPath) {
    if (!localPath) {
        return null;
    }

    // Get config from database
    const config = await getCloudinaryConfig();

    if (!config) {
        console.warn('⚠️ Cloudinary not configured in Settings, returning local path');
        return localPath;
    }

    // Configure Cloudinary with database credentials
    cloudinary.config(config);

    try {
        // Resolve full path if relative
        let fullPath = localPath;
        if (localPath.startsWith('/uploads/')) {
            // Convert /uploads/... to absolute path
            fullPath = path.join(process.cwd(), localPath);
        }

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.error(`File not found: ${fullPath}`);
            return localPath; // Return original path as fallback
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fullPath, {
            folder: 'social-scheduler',
            resource_type: 'auto', // auto-detect image/video
            use_filename: true,
            unique_filename: true
        });

        console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
        return result.secure_url;

    } catch (error) {
        console.error('❌ Cloudinary upload error:', error.message);
        return localPath; // Return original path as fallback
    }
}

/**
 * Check if Cloudinary is configured
 */
export async function isCloudinaryConfigured() {
    const config = await getCloudinaryConfig();
    return !!config;
}

export default {
    uploadToCloudinary,
    isCloudinaryConfigured
};
