import express from 'express';
import { createRoom, getRoom, getRoomMessages } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authenticateToken, createRoom);
router.get('/:code', authenticateToken, getRoom);
router.get('/:code/messages', authenticateToken, getRoomMessages);

export default router;
