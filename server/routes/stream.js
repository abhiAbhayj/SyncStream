import express from 'express';
import { resolveStream, proxyStream } from '../controllers/streamController.js';

const router = express.Router();

// Resolve direct .m3u8 stream and subtitles
router.get('/resolve', resolveStream);

// Stream proxy with Range seeking & CORS
router.get('/proxy', proxyStream);

export default router;
