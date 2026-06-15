import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_syncstream_2026';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields (username, email, password) are required.' });
  }

  try {
    // 1. Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Define a default avatar
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    // 4. Insert into DB
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, avatarUrl]
    );

    const userId = result.insertId;

    // 5. Generate token
    const token = jwt.sign({ id: userId, username, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    console.error('[Auth Controller Register Error]:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('[Auth Controller Login Error]:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('[Auth Controller Get Profile Error]:', error);
    res.status(500).json({ error: 'Server error retrieving profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const { username, avatar_url } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    // Check if new username is taken by someone else
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    // Update profile details
    if (avatar_url) {
      await db.query(
        'UPDATE users SET username = ?, avatar_url = ? WHERE id = ?',
        [username, avatar_url, req.user.id]
      );
    } else {
      await db.query(
        'UPDATE users SET username = ? WHERE id = ?',
        [username, req.user.id]
      );
    }

    // Fetch updated user
    const [users] = await db.query(
      'SELECT id, username, email, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    // Return updated token if username changed
    const updatedToken = jwt.sign(
      { id: users[0].id, username: users[0].username, email: users[0].email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token: updatedToken,
      user: users[0]
    });
  } catch (error) {
    console.error('[Auth Controller Update Profile Error]:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
};
