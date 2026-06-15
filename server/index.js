import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, db } from './config/db.js';

import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import roomRoutes from './routes/rooms.js';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS setup
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/rooms', roomRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Cache for room media playback states to sync late-joiners
// Format: { [roomCode]: { event: 'play'|'pause', time: 0, lastUpdated: timestamp } }
const roomPlaybackStates = {};

// Socket.io Server Setup
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // 1. Join a Watch Room
  socket.on('join_room', ({ roomCode, username }) => {
    socket.join(roomCode);
    console.log(`[Socket] User '${username}' joined room: ${roomCode}`);

    // Notify others in room
    socket.to(roomCode).emit('user_joined', { username, socketId: socket.id });

    // Send the joining user the current playback state if exists
    if (roomPlaybackStates[roomCode]) {
      const state = roomPlaybackStates[roomCode];
      // If it is playing, calculate the elapsed time since last sync
      let currentTime = state.time || 0;
      if (state.event === 'play' && state.lastUpdated) {
        const elapsedSeconds = (Date.now() - state.lastUpdated) / 1000;
        currentTime += elapsedSeconds;
      }
      socket.emit('media_sync_initial', {
        ...state,
        time: currentTime
      });
    } else {
      socket.emit('media_sync_initial', { event: 'pause', time: 0 });
    }
  });

  // 2. Sync Media playback changes (Play / Pause / Seek)
  socket.on('media_sync', (data) => {
    const { roomCode, event, time, sender } = data;
    console.log(`[Socket] Media sync in ${roomCode || 'unknown'}: '${event}' at ${time}s (by ${sender})`);

    // Cache state
    roomPlaybackStates[roomCode] = {
      ...roomPlaybackStates[roomCode],
      ...data,
      lastUpdated: Date.now()
    };

    // Broadcast to everyone else in the room
    socket.to(roomCode).emit('media_sync', data);
  });

  // 3. Sync chat messages and save to MySQL
  socket.on('send_message', async ({ roomCode, messageText, userId }) => {
    if (!roomCode || !messageText || !userId) return;

    try {
      // Find room database ID
      const [rooms] = await db.query('SELECT id FROM watch_rooms WHERE room_code = ?', [roomCode]);
      if (rooms.length === 0) return;
      const roomId = rooms[0].id;

      // Insert message
      const [result] = await db.query(
        'INSERT INTO chat_messages (room_id, user_id, message_text) VALUES (?, ?, ?)',
        [roomId, userId, messageText]
      );

      // Fetch sender details
      const [users] = await db.query('SELECT username, avatar_url FROM users WHERE id = ?', [userId]);
      const user = users[0];

      const messagePayload = {
        id: result.insertId,
        message_text: messageText,
        sent_at: new Date(),
        user_id: userId,
        username: user.username,
        avatar_url: user.avatar_url
      };

      // Emit to all users in the room
      io.to(roomCode).emit('receive_message', messagePayload);
    } catch (err) {
      console.error('[Socket Message Error]:', err);
    }
  });

  // 4. Leave Room
  socket.on('leave_room', ({ roomCode, username }) => {
    socket.leave(roomCode);
    console.log(`[Socket] User '${username}' left room: ${roomCode}`);
    socket.to(roomCode).emit('user_left', { username });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start DB and Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Bootstrap MySQL database tables
    await initDB();
  } catch (error) {
    console.warn('[Server] DB failed to initialize on startup. Operating in offline-db mode. Please start MySQL in XAMPP.');
  }

  server.listen(PORT, () => {
    console.log(`[Server] Run-level SUCCESS. Hosting on http://localhost:${PORT}`);
  });
};

startServer();
