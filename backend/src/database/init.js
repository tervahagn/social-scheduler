import sqlite3 from 'sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';
const schemaPath = join(__dirname, 'schema.sql');

console.log('Initializing database...');
console.log('Database path:', dbPath);

// Create data directory if it doesn't exist
mkdirSync(dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath);

// Read and execute schema
const schema = readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }

    console.log('✅ Database initialized successfully!');

    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
        if (!err) {
            console.log('Tables created:');
            tables.forEach(table => console.log(`  - ${table.name}`));
        }
        db.close();
    });
});
