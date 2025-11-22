import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';
const db = new sqlite3.Database(dbPath);

console.log('Running prompt migration...');

const migration = readFileSync('./src/database/migrate-prompts.sql', 'utf8');

db.exec(migration, (err) => {
    if (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }

    console.log('✅ Prompts migrated to database successfully!');
    db.close();
});
