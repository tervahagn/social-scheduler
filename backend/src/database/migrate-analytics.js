import db from './db.js';

async function migrate() {
    console.log('Starting analytics migration...');

    try {
        // 1. Add columns to posts table
        console.log('Adding columns to posts table...');
        const columns = [
            'generation_time_ms INTEGER',
            'edit_count INTEGER DEFAULT 0',
            'approved_at DATETIME',
            'published_at DATETIME',
            'publish_error TEXT'
        ];

        for (const col of columns) {
            try {
                await db.prepare(`ALTER TABLE posts ADD COLUMN ${col}`).run();
                console.log(`Added ${col.split(' ')[0]}`);
            } catch (e) {
                // Ignore error if column likely exists
                if (!e.message.includes('duplicate column name')) {
                    console.log(`Note: Could not add ${col.split(' ')[0]}: ${e.message}`);
                }
            }
        }

        // 2. Create analytics_events table
        console.log('Creating analytics_events table...');
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                entity_id INTEGER,
                entity_type TEXT,
                metadata JSON,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // 3. Create post_metrics table
        console.log('Creating post_metrics table...');
        await db.prepare(`
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
            )
        `).run();

        // Index for post_metrics
        await db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_post_metrics_post_collected 
            ON post_metrics(post_id, collected_at DESC)
        `).run();

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
