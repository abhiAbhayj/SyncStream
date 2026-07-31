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
  const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  try {
    // 1. Initial connection without database to bootstrap
    const bootstrapConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl: sslConfig,
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
      ssl: sslConfig,
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
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        reset_otp VARCHAR(255) DEFAULT NULL,
        reset_otp_expiry DATETIME DEFAULT NULL,
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

    // ── Safe Auto-Migrations using INFORMATION_SCHEMA ──────────────────────
    // Check actual live column state before touching anything.

    // 1. Rename 'email' → 'phone_number' if email column still exists
    const [emailCols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'`
    );
    if (emailCols.length > 0) {
      await pool.query('ALTER TABLE users CHANGE COLUMN email phone_number VARCHAR(20) UNIQUE NOT NULL');
      console.log('[DB] Migration: Renamed email → phone_number ✓');
    }

    // 2. Add 'phone_number' if it doesn't exist at all (fresh install edge case)
    const [phoneCols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone_number'`
    );
    if (phoneCols.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) UNIQUE NOT NULL DEFAULT ""');
      console.log('[DB] Migration: Added phone_number column ✓');
    }

    // 3. Add reset_otp if missing
    const [otpCols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_otp'`
    );
    if (otpCols.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN reset_otp VARCHAR(255) DEFAULT NULL');
      console.log('[DB] Migration: Added reset_otp column ✓');
    }

    // 4. Add reset_otp_expiry if missing
    const [expiryCols] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reset_otp_expiry'`
    );
    if (expiryCols.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN reset_otp_expiry DATETIME DEFAULT NULL');
      console.log('[DB] Migration: Added reset_otp_expiry column ✓');
    }

    console.log('[DB] Database tables and migrations initialized successfully.');
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
