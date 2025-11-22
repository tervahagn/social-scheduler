import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/scheduler.db');
const sqlPath = path.join(__dirname, 'migrate-new-platforms.sql');

const sqlite3Pkg = sqlite3.verbose();
const db = new sqlite3Pkg.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the scheduler database.');
});

const sql = fs.readFileSync(sqlPath, 'utf8');

db.exec(sql, (err) => {
    if (err) {
        console.error('Error executing migration:', err.message);
        process.exit(1);
    }
    console.log('Migration executed successfully.');
    db.close();
});

