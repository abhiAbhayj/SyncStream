import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let isDbConnected = false;
let retryInterval = null;

export async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || 'syncstream_db';

  try {
    // 1. Initial connection without database to bootstrap
    const bootstrapConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 3000
    });

    console.log(`[DB] Connected to MySQL. Bootstrapping database '${dbName}' if needed...`);
    await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await bootstrapConnection.end();

    // 2. Create active database connection pool
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // 3. Initialize schema tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT 'default_avatar.png',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_watchlists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        external_media_id VARCHAR(50) NOT NULL,
        media_type ENUM('movie', 'tv', 'anime', 'manga') NOT NULL,
        title VARCHAR(255) NOT NULL,
        poster_path VARCHAR(255),
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_media (user_id, external_media_id, media_type)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS watch_rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_code VARCHAR(12) UNIQUE NOT NULL,
        host_id INT NOT NULL,
        external_media_id VARCHAR(50) NOT NULL,
        media_type ENUM('movie', 'tv', 'anime') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        message_text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES watch_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('[DB] Database tables initialized successfully.');
    isDbConnected = true;

    // Clear reconnect interval if database successfully initialized
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  } catch (error) {
    isDbConnected = false;
    console.error(`[DB] Database connection / schema bootstrap failed: ${error.message}`);
    
    // Set up auto-retry if not already running
    if (!retryInterval) {
      console.log('[DB] MySQL might be offline. Setting up background auto-reconnect retries every 10s...');
      retryInterval = setInterval(() => {
        console.log('[DB] Retrying connection to MySQL...');
        initDB().catch(() => {});
      }, 10000);
      retryInterval.unref(); // Unref so it doesn't block node process exit
    }
    
    throw error;
  }
}

export const db = {
  async query(sql, params) {
    if (!isDbConnected || !pool) {
      throw new Error('Database connection is offline. Please make sure MySQL is started in your XAMPP Control Panel.');
    }
    return pool.query(sql, params);
  },
  isConnected() {
    return isDbConnected;
  }
};
