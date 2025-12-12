import db from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = join(__dirname, 'schema.sql');

async function initDatabase() {
    console.log('Initializing database...');
    console.log('Database path:', process.env.DATABASE_PATH || './data/scheduler.db');

    try {
        // Read and execute schema
        const schema = readFileSync(schemaPath, 'utf8');
        await db.exec(schema);

        console.log('✅ Database initialized successfully!');

        // List tables
        const database = await db.getDatabase();
        const result = database.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

        if (result.length > 0) {
            console.log('Tables created:');
            result[0].values.forEach(row => console.log(`  - ${row[0]}`));
        }

        db.save();
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDatabase();

