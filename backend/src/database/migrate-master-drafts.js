import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';
const db = new sqlite3.Database(dbPath);

console.log('🔄 Running master_drafts migration...');

const migration = readFileSync('./src/database/migrate-master-drafts.sql', 'utf8');

db.exec(migration, (err) => {
    if (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('   - Created master_drafts table');
    console.log('   - Added indexes');
    console.log('   - Added master_draft_id to posts table');
    db.close();
});
