import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../../data/scheduler.db');

console.log('📦 Running Quick Post Scheduling Migration...');
console.log('Database:', dbPath);

const db = new Database(dbPath);

try {
    // Check if scheduled_at column exists in quick_post_items
    const itemsColumns = db.prepare("PRAGMA table_info(quick_post_items)").all();
    const hasScheduledAtItems = itemsColumns.some(col => col.name === 'scheduled_at');

    if (!hasScheduledAtItems) {
        console.log('Adding scheduled_at to quick_post_items...');
        db.exec('ALTER TABLE quick_post_items ADD COLUMN scheduled_at DATETIME');
        console.log('✅ Added scheduled_at to quick_post_items');
    } else {
        console.log('ℹ️  quick_post_items already has scheduled_at column');
    }

    // Check if scheduled_at column exists in quick_posts
    const postsColumns = db.prepare("PRAGMA table_info(quick_posts)").all();
    const hasScheduledAtPosts = postsColumns.some(col => col.name === 'scheduled_at');

    if (!hasScheduledAtPosts) {
        console.log('Adding scheduled_at to quick_posts...');
        db.exec('ALTER TABLE quick_posts ADD COLUMN scheduled_at DATETIME');
        console.log('✅ Added scheduled_at to quick_posts');
    } else {
        console.log('ℹ️  quick_posts already has scheduled_at column');
    }

    console.log('✅ Quick Post Scheduling Migration completed!');
} catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
} finally {
    db.close();
}
