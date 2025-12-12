import initSqlJs from 'sql.js';
import dotenv from 'dotenv';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname } from 'path';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';

// Create directory if it doesn't exist
mkdirSync(dirname(dbPath), { recursive: true });

// Initialize SQL.js and database
let database = null;
let SQL = null;

async function initDatabase() {
    if (database) return database;

    // Initialize SQL.js
    SQL = await initSqlJs();

    let isNewDb = false;

    // Load existing database or create new one
    if (existsSync(dbPath)) {
        const fileBuffer = readFileSync(dbPath);
        database = new SQL.Database(fileBuffer);
    } else {
        database = new SQL.Database();
        isNewDb = true;
    }

    // Enable foreign keys
    database.run('PRAGMA foreign_keys = ON');

    // Check if schema exists, if not initialize it
    const tablesCheck = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='platforms'");
    if (tablesCheck.length === 0 || tablesCheck[0].values.length === 0) {
        console.log('📦 Initializing database schema...');
        await initializeSchema();
        console.log('✅ Database schema initialized!');
    }

    // Auto-save on process exit
    process.on('exit', saveDatabase);
    process.on('SIGINT', () => { saveDatabase(); process.exit(); });
    process.on('SIGTERM', () => { saveDatabase(); process.exit(); });

    return database;
}

// Initialize database schema with all tables
async function initializeSchema() {
    const schema = `
        -- Core tables
        CREATE TABLE IF NOT EXISTS briefs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            media_url TEXT,
            media_type TEXT,
            link_url TEXT,
            selected_platforms TEXT,
            slug TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            webhook_url TEXT,
            prompt_file TEXT NOT NULL,
            prompt_content TEXT,
            ultra_short_prompt TEXT,
            is_active BOOLEAN DEFAULT 1,
            config JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brief_id INTEGER NOT NULL,
            platform_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'draft',
            edited_content TEXT,
            published_at DATETIME,
            error_message TEXT,
            scheduled_at DATETIME,
            scheduled_comment TEXT,
            comment_scheduled_at DATETIME,
            generation_time_ms INTEGER,
            edit_count INTEGER DEFAULT 0,
            approved_at DATETIME,
            publish_error TEXT,
            master_draft_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            version INTEGER DEFAULT 1,
            link_url TEXT,
            FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE,
            FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS brief_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brief_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mime_type TEXT,
            file_size INTEGER,
            category TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS master_drafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brief_id INTEGER NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            content TEXT NOT NULL,
            correction_prompt TEXT,
            status TEXT DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (brief_id) REFERENCES briefs(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            entity_id INTEGER,
            entity_type TEXT,
            metadata JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS post_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            impressions INTEGER DEFAULT 0,
            reach INTEGER DEFAULT 0,
            clicks INTEGER DEFAULT 0,
            engagement_rate REAL,
            raw_data JSON,
            FOREIGN KEY (post_id) REFERENCES posts(id)
        );

        CREATE TABLE IF NOT EXISTS publish_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 3,
            last_error TEXT,
            scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS quick_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            published_at DATETIME,
            scheduled_at DATETIME
        );

        CREATE TABLE IF NOT EXISTS quick_post_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quick_post_id INTEGER NOT NULL,
            platform_id INTEGER NOT NULL,
            content TEXT,
            title TEXT,
            status TEXT DEFAULT 'pending',
            published_at DATETIME,
            scheduled_at DATETIME,
            error_message TEXT,
            FOREIGN KEY (quick_post_id) REFERENCES quick_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS quick_post_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quick_post_item_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mime_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (quick_post_item_id) REFERENCES quick_post_items(id) ON DELETE CASCADE
        );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_posts_brief_id ON posts(brief_id);
        CREATE INDEX IF NOT EXISTS idx_posts_platform_id ON posts(platform_id);
        CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    `;

    database.exec(schema);

    // Insert default platforms
    const platforms = [
        ['linkedin', 'LinkedIn (Company)', 'linkedin.md', 'Create a professional LinkedIn post based on the brief. Max 3000 chars, 3-5 hashtags, emojis welcome.'],
        ['linkedin-personal', 'LinkedIn (Personal)', 'linkedin-personal.md', 'Create a personal LinkedIn post. Authentic tone, storytelling focus.'],
        ['facebook', 'Facebook', 'facebook.md', 'Create a friendly Facebook post. Conversational tone, emojis, up to 500-1000 chars.'],
        ['instagram', 'Instagram', 'instagram.md', 'Create an Instagram caption. Visual style, 10-15 hashtags at end.'],
        ['twitter', 'X (Twitter)', 'twitter.md', 'Create a tweet. Max 280 characters, bold and catchy.'],
        ['google-business', 'Google Business', 'google-business.md', 'Create a Google Business post. Local focus, clear CTA.'],
        ['reddit', 'Reddit', 'reddit.md', 'Create a Reddit post. Authentic, discussion-focused, no hashtags.'],
        ['youtube-posts', 'YouTube Posts', 'youtube-posts.md', 'Create a YouTube Community post. Casual, encourage interaction.']
    ];

    for (const [name, displayName, promptFile, promptContent] of platforms) {
        database.run(
            'INSERT OR IGNORE INTO platforms (name, display_name, prompt_file, prompt_content) VALUES (?, ?, ?, ?)',
            [name, displayName, promptFile, promptContent]
        );
    }

    saveDatabase();
}


function saveDatabase() {
    if (database) {
        const data = database.export();
        const buffer = Buffer.from(data);
        writeFileSync(dbPath, buffer);
    }
}

// Save database periodically (every 30 seconds)
setInterval(saveDatabase, 30000);

// Wrapper to maintain same API as before
const db = {
    prepare: (sql) => {
        return {
            run: async (...params) => {
                await initDatabase();
                try {
                    database.run(sql, params);
                    saveDatabase();
                    const lastId = database.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] || 0;
                    const changes = database.getRowsModified();
                    return { lastInsertRowid: lastId, changes };
                } catch (err) {
                    throw err;
                }
            },
            get: async (...params) => {
                await initDatabase();
                try {
                    const stmt = database.prepare(sql);
                    stmt.bind(params);
                    if (stmt.step()) {
                        const columns = stmt.getColumnNames();
                        const values = stmt.get();
                        stmt.free();
                        const row = {};
                        columns.forEach((col, i) => row[col] = values[i]);
                        return row;
                    }
                    stmt.free();
                    return undefined;
                } catch (err) {
                    throw err;
                }
            },
            all: async (...params) => {
                await initDatabase();
                try {
                    const stmt = database.prepare(sql);
                    stmt.bind(params);
                    const rows = [];
                    const columns = stmt.getColumnNames();
                    while (stmt.step()) {
                        const values = stmt.get();
                        const row = {};
                        columns.forEach((col, i) => row[col] = values[i]);
                        rows.push(row);
                    }
                    stmt.free();
                    return rows;
                } catch (err) {
                    throw err;
                }
            }
        };
    },
    // Direct exec for schema/migrations
    exec: async (sql) => {
        await initDatabase();
        database.exec(sql);
        saveDatabase();
    },
    // Get raw database for advanced operations
    getDatabase: async () => {
        await initDatabase();
        return database;
    },
    // Manual save
    save: saveDatabase
};

export default db;

