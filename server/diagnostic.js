import dotenv from 'dotenv';
dotenv.config();

import { db } from './config/db.js';
import nodemailer from 'nodemailer';

(async () => {
  console.log('--- DIAGNOSTIC TEST START ---');
  
  // 1. Test Database
  try {
    const [cols] = await db.query("SHOW COLUMNS FROM users LIKE 'reset_token'");
    if (cols.length === 0) {
      console.log('[ERROR] The reset_token column DOES NOT EXIST in the users table! You did not run the SQL command.');
    } else {
      console.log('[OK] Database columns exist.');
    }
  } catch (err) {
    console.log('[ERROR] Database connection failed:', err.message);
  }

  // 2. Test Nodemailer Credentials
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) {
    console.log('[ERROR] EMAIL_USER or EMAIL_PASS is missing from .env!');
  } else {
    console.log('[INFO] Found Email Credentials. Attempting SMTP connection for:', user);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
    
    try {
      await transporter.verify();
      console.log('[OK] Nodemailer successfully authenticated with Gmail!');
    } catch (err) {
      console.log('[ERROR] Nodemailer failed to authenticate:', err.message);
    }
  }
  
  console.log('--- DIAGNOSTIC TEST END ---');
  process.exit();
})();
