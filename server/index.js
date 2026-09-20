import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, db } from './config/db.js';

import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import roomRoutes from './routes/rooms.js';
import musicRoutes from './routes/music.js';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS setup with dynamic LAN and localhost support
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or any local/LAN/production origin
    if (!origin) return callback(null, true);
    callback(null, true); // Allow all valid origins dynamically with credentials
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/music', musicRoutes);

// Health check endpoints (both /health and /api/health for Netlify proxy compatibility)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), db: db.isConnected() });
});

// Cache for room media playback states to sync late-joiners
// Format: { [roomCode]: { event: 'play'|'pause', time: 0, lastUpdated: timestamp } }
const roomPlaybackStates = {};

// Cache for active voice/video call participants
// Format: { [roomCode]: { [socketId]: { socketId, user, audioEnabled, videoEnabled } } }
const callParticipants = {};

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
  socket.on('send_message', async ({ roomCode, messageText, userId, username, avatarUrl }) => {
    if (!roomCode || !messageText || !userId) return;

    let messagePayload = {
      id: Date.now(),
      message_text: messageText,
      sent_at: new Date().toISOString(),
      user_id: userId,
      username: username || 'User',
      avatar_url: avatarUrl || 'default_avatar.png'
    };

    try {
      if (db.isConnected()) {
        const [rooms] = await db.query('SELECT id FROM watch_rooms WHERE room_code = ?', [roomCode]);
        if (rooms.length > 0) {
          const roomId = rooms[0].id;
          const [result] = await db.query(
            'INSERT INTO chat_messages (room_id, user_id, message_text) VALUES (?, ?, ?)',
            [roomId, userId, messageText]
          );
          if (result?.insertId) {
            messagePayload.id = result.insertId;
          }
          const [users] = await db.query('SELECT username, avatar_url FROM users WHERE id = ?', [userId]);
          if (users.length > 0) {
            messagePayload.username = users[0].username;
            messagePayload.avatar_url = users[0].avatar_url;
          }
        }
      }
    } catch (err) {
      console.error('[Socket Message DB Error]:', err.message);
    }

    // Broadcast message to all users in the room immediately
    io.to(roomCode).emit('receive_message', messagePayload);
  });

  // 4. Leave Room
  socket.on('leave_room', ({ roomCode, username }) => {
    socket.leave(roomCode);
    console.log(`[Socket] User '${username}' left room: ${roomCode}`);
    socket.to(roomCode).emit('user_left', { username });
    
    // Clean up call presence if user was in voice/video call
    if (callParticipants[roomCode] && callParticipants[roomCode][socket.id]) {
      delete callParticipants[roomCode][socket.id];
      socket.to(roomCode).emit('webrtc_user_left_call', { socketId: socket.id });
    }
  });

  // ── WebRTC Voice & Video Calling Signaling ──────────────────────────────────
  socket.on('webrtc_join_call', ({ roomCode, user, audioEnabled, videoEnabled }) => {
    if (!roomCode) return;
    if (!callParticipants[roomCode]) {
      callParticipants[roomCode] = {};
    }

    const participantInfo = {
      socketId: socket.id,
      user: user || { id: socket.id, username: 'Guest', avatar_url: 'default_avatar.png' },
      audioEnabled: !!audioEnabled,
      videoEnabled: !!videoEnabled,
      joinedAt: Date.now()
    };

    callParticipants[roomCode][socket.id] = participantInfo;
    console.log(`[WebRTC] User '${participantInfo.user.username}' (${socket.id}) joined call in room: ${roomCode}`);

    // Send existing call peers back to the newly joined peer
    const existingPeers = Object.values(callParticipants[roomCode]).filter(p => p.socketId !== socket.id);
    socket.emit('webrtc_existing_peers', existingPeers);

    // Broadcast to other peers in room that a new user joined the call
    socket.to(roomCode).emit('webrtc_user_joined_call', participantInfo);
  });

  // Relay WebRTC signals (Offers, Answers, ICE candidates)
  socket.on('webrtc_signal', ({ to, signal, user }) => {
    if (!to || !signal) return;
    io.to(to).emit('webrtc_signal', {
      from: socket.id,
      signal,
      user
    });
  });

  // Media toggle (Mute / Camera off sync)
  socket.on('webrtc_media_toggle', ({ roomCode, audioEnabled, videoEnabled }) => {
    if (roomCode && callParticipants[roomCode] && callParticipants[roomCode][socket.id]) {
      callParticipants[roomCode][socket.id].audioEnabled = audioEnabled;
      callParticipants[roomCode][socket.id].videoEnabled = videoEnabled;
      socket.to(roomCode).emit('webrtc_user_media_toggle', {
        socketId: socket.id,
        audioEnabled,
        videoEnabled
      });
    }
  });

  // Leave Voice/Video Call explicitly
  socket.on('webrtc_leave_call', ({ roomCode }) => {
    if (roomCode && callParticipants[roomCode] && callParticipants[roomCode][socket.id]) {
      delete callParticipants[roomCode][socket.id];
      console.log(`[WebRTC] User (${socket.id}) left call in room: ${roomCode}`);
      socket.to(roomCode).emit('webrtc_user_left_call', { socketId: socket.id });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    // Clean up call participant records across all rooms
    for (const roomCode in callParticipants) {
      if (callParticipants[roomCode][socket.id]) {
        delete callParticipants[roomCode][socket.id];
        io.to(roomCode).emit('webrtc_user_left_call', { socketId: socket.id });
      }
    }
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
