import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/scheduler.db');

const db = new sqlite3.Database(dbPath);

const schema = `
-- Main quick post
CREATE TABLE IF NOT EXISTS quick_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    scheduled_at DATETIME
);

-- Platform-specific content
CREATE TABLE IF NOT EXISTS quick_post_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quick_post_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'pending', -- pending, published, failed, scheduled
    published_at DATETIME,
    scheduled_at DATETIME,
    error_message TEXT,
    FOREIGN KEY (quick_post_id) REFERENCES quick_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Media files
CREATE TABLE IF NOT EXISTS quick_post_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quick_post_item_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quick_post_item_id) REFERENCES quick_post_items(id) ON DELETE CASCADE
);
`;

console.log('Migrating Quick Post tables...');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error running migration:', err);
        process.exit(1);
    }
    console.log('✅ Quick Post tables created successfully!');
    db.close();
});
