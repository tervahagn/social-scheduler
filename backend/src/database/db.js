import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || './data/scheduler.db';

// Create directory if it doesn't exist
mkdirSync(dirname(dbPath), { recursive: true });

// Create connection
const dbRaw = new sqlite3.Database(dbPath);

// Enable foreign keys
dbRaw.run('PRAGMA foreign_keys = ON');

// Wrapper to make sqlite3 work like better-sqlite3 (synchronous-style API)
const db = {
    prepare: (sql) => {
        return {
            run: (...params) => {
                return new Promise((resolve, reject) => {
                    dbRaw.run(sql, params, function (err) {
                        if (err) reject(err);
                        else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
                    });
                });
            },
            get: (...params) => {
                return new Promise((resolve, reject) => {
                    dbRaw.get(sql, params, (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            },
            all: (...params) => {
                return new Promise((resolve, reject) => {
                    dbRaw.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
            }
        };
    }
};

export default db;
