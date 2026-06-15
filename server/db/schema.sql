CREATE DATABASE IF NOT EXISTS syncstream_db;
USE syncstream_db;

-- 1. User accounts and presence tracking
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT 'default_avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User specific cross-referenced libraries (Stores API unique string keys)
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

-- 3. Dynamic session state for operational streaming rooms
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

-- 4. Audit trail tracking internal history logs
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES watch_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
