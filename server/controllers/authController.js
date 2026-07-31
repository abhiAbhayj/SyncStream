import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const [users] = await db.query('SELECT id, username FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User with this email does not exist.' });
    }

    const resetToken = Array.from(Array(32), () => Math.floor(Math.random() * 36).toString(36)).join('');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetTokenHash, expiry, users[0].id]
    );

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email Layout
    const mailOptions = {
      from: `"SyncStream Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'SyncStream - Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050408; padding: 40px; border-radius: 16px; color: #ffffff;">
          <h2 style="color: #00f0ff; text-align: center; margin-bottom: 30px;">SyncStream Password Reset</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #d1d5db;">Hello ${users[0].username},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #d1d5db;">You recently requested to reset your password for your SyncStream account. Click the button below to proceed.</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(to right, #00f0ff, #8b5cf6); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #9ca3af;">If you did not request a password reset, please ignore this email or reply to contact support if you have questions.</p>
          <p style="font-size: 14px; color: #9ca3af;">This link is only valid for the next 60 minutes.</p>
          <hr style="border-color: #2d1944; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">SyncStream &copy; ${new Date().getFullYear()}</p>
        </div>
      `
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL DISPATCHED] Reset link successfully sent to ${email}`);

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ error: 'Server error processing forgot password.' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required.' });

  try {
    const [users] = await db.query('SELECT id, reset_token, reset_token_expiry FROM users WHERE reset_token IS NOT NULL');
    let targetUser = null;

    for (let user of users) {
      if (new Date(user.reset_token_expiry) > new Date()) {
        const isMatch = await bcrypt.compare(token, user.reset_token);
        if (isMatch) {
          targetUser = user;
          break;
        }
      }
    }

    if (!targetUser) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [newPasswordHash, targetUser.id]
    );

    res.json({ message: 'Password has been successfully reset. You may now login.' });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    res.status(500).json({ error: 'Server error processing reset password.' });
  }
};
