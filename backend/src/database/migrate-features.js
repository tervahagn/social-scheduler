import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';
const db = new sqlite3.Database(dbPath);

console.log('Running features migration...');

const migration = readFileSync('./src/database/migrate-features.sql', 'utf8');

db.exec(migration, (err) => {
    if (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }

    console.log('✅ Features migrated successfully!');
    console.log('   - Added scheduled posting');
    console.log('   - Added scheduled comments');
    console.log('   - Added settings table with master prompt');
    console.log('   - Added selected platforms tracking');
    db.close();
});
