import { db } from '../config/db.js';

// Generate a random unique room code
const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ROOM-';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const createRoom = async (req, res) => {
  const { external_media_id, media_type } = req.body;
  const host_id = req.user.id;

  if (!external_media_id || !media_type) {
    return res.status(400).json({ error: 'Media ID and type are required to open a Watch Room.' });
  }

  try {
    // Generate a unique room code
    let roomCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      roomCode = generateRoomCode();
      const [existing] = await db.query('SELECT id FROM watch_rooms WHERE room_code = ?', [roomCode]);
      if (existing.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate a unique room code.' });
    }

    // Insert new room into DB
    const [result] = await db.query(
      'INSERT INTO watch_rooms (room_code, host_id, external_media_id, media_type, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [roomCode, host_id, external_media_id, media_type]
    );

    res.status(201).json({
      message: 'Watch Room created successfully.',
      room: {
        id: result.insertId,
        room_code: roomCode,
        host_id,
        external_media_id,
        media_type
      }
    });
  } catch (error) {
    console.error('[Room Controller Create Error]:', error);
    res.status(500).json({ error: 'Server error creating watch room.' });
  }
};

export const getRoom = async (req, res) => {
  const { code } = req.params;

  try {
    // Fetch room status and host name
    const [rooms] = await db.query(
      `SELECT wr.*, u.username as host_username, u.avatar_url as host_avatar
       FROM watch_rooms wr
       JOIN users u ON wr.host_id = u.id
       WHERE wr.room_code = ? AND wr.is_active = TRUE`,
      [code]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found or no longer active.' });
    }

    res.json({ room: rooms[0] });
  } catch (error) {
    console.error('[Room Controller Get Error]:', error);
    res.status(500).json({ error: 'Server error fetching watch room.' });
  }
};

export const getRoomMessages = async (req, res) => {
  const { code } = req.params;

  try {
    const [messages] = await db.query(
      `SELECT cm.id, cm.message_text, cm.sent_at, u.username, u.avatar_url, u.id as user_id
       FROM chat_messages cm
       JOIN watch_rooms wr ON cm.room_id = wr.id
       JOIN users u ON cm.user_id = u.id
       WHERE wr.room_code = ?
       ORDER BY cm.sent_at ASC`,
      [code]
    );

    res.json(messages);
  } catch (error) {
    console.error('[Room Controller Messages Error]:', error);
    res.status(500).json({ error: 'Server error fetching chat history.' });
  }
};
