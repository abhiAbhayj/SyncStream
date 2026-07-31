import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_syncstream_2026';

export const register = async (req, res) => {
  const { username, phone_number, password } = req.body;

  if (!username || !phone_number || !password) {
    return res.status(400).json({ error: 'All fields (username, phone_number, password) are required.' });
  }

  try {
    // 1. Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR phone_number = ?',
      [username, phone_number]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or phone number already exists.' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Define a default avatar
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    // 4. Insert into DB
    const [result] = await db.query(
      'INSERT INTO users (username, phone_number, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [username, phone_number, passwordHash, avatarUrl]
    );

    const userId = result.insertId;

    // 5. Generate token
    const token = jwt.sign({ id: userId, username, phone_number }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        phone_number,
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    console.error('[Auth Controller Register Error]:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ error: 'Phone number and password are required.' });
  }

  try {
    // 1. Find user by phone_number
    const [users] = await db.query('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid phone number or password.' });
    }

    const user = users[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password.' });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, phone_number: user.phone_number },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
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
      'SELECT id, username, phone_number, avatar_url, created_at FROM users WHERE id = ?',
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
      'SELECT id, username, phone_number, avatar_url FROM users WHERE id = ?',
      [req.user.id]
    );

    // Return updated token if username changed
    const updatedToken = jwt.sign(
      { id: users[0].id, username: users[0].username, phone_number: users[0].phone_number },
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
  const { phone_number } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Phone number is required.' });

  try {
    const [users] = await db.query('SELECT id, username FROM users WHERE phone_number = ?', [phone_number]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User with this phone number does not exist.' });
    }

    // Generate 6-Digit OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpHash = await bcrypt.hash(resetOtp, 10);
    const expiry = new Date(Date.now() + 15 * 60000); // 15 mins

    await db.query(
      'UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE id = ?',
      [resetOtpHash, expiry, users[0].id]
    );
    
    // Check if Twilio API credentials exist
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      // NOTE: User must run `npm install twilio` to actually use this live!
      try {
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your SyncStream password reset code is: ${resetOtp}. Do not share this code.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone_number
        });
        console.log(`[SMS DISPATCHED] OTP sent to ${phone_number}`);
      } catch (smsError) {
        console.error('[SMS ERROR] Failed to send text, falling back to mock.', smsError.message);
        console.log(`\n\n[MOCK SMS] OTP for ${phone_number} is: ${resetOtp}\n\n`);
      }
    } else {
      // Fallback Mock SMS if credentials aren't setup
      console.log(`\n\n[MOCK SMS] Password Reset OTP for ${phone_number}:\n[ ${resetOtp} ]\n\n`);
    }

    res.json({ message: 'If an account with that number exists, an SMS reset code has been sent.' });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ error: 'Server error processing forgot password.' });
  }
};

export const verifyOtp = async (req, res) => {
  const { phone_number, otp } = req.body;
  if (!phone_number || !otp) return res.status(400).json({ error: 'Phone number and OTP are required.' });

  try {
    const [users] = await db.query('SELECT id, reset_otp, reset_otp_expiry FROM users WHERE phone_number = ?', [phone_number]);
    if (users.length === 0 || !users[0].reset_otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const user = users[0];
    if (new Date(user.reset_otp_expiry) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.reset_otp);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect OTP.' });
    }

    // Generate a short-lived temporary secure session token to authorize the password change
    const secureResetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });

    res.json({ message: 'OTP Verified.', secureResetToken });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    res.status(500).json({ error: 'Server error verifying OTP.' });
  }
};

export const resetPassword = async (req, res) => {
  const { secureResetToken, newPassword } = req.body;
  if (!secureResetToken || !newPassword) return res.status(400).json({ error: 'Token and new password are required.' });

  try {
    const decoded = jwt.verify(secureResetToken, JWT_SECRET);
    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ error: 'Invalid token purpose.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
      [newPasswordHash, decoded.id]
    );

    res.json({ message: 'Password has been successfully reset. You may now login.' });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Your reset session has expired. Please start over.' });
    }
    res.status(500).json({ error: 'Server error processing reset password.' });
  }
};
