const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database/users.db';

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      const fs = require('fs');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to SQLite database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  initializeTables() {
    return new Promise((resolve, reject) => {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          bio TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createRefreshTokensTable = `
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token TEXT UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `;

      this.db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
          reject(err);
        } else {
          this.db.run(createRefreshTokensTable, (err) => {
            if (err) {
              console.error('Error creating refresh_tokens table:', err.message);
              reject(err);
            } else {
              console.log('Database tables initialized successfully');
              resolve();
            }
          });
        }
      });
    });
  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();
