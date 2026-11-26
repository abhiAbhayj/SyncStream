import express from 'express';
import {
  getTrending,
  searchMedia,
  getMediaDetail,
  getMangaChapters,
  getMangaPages,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getContinueWatching,
  saveContinueWatching,
  removeContinueWatching,
  syncContinueWatching,
  getCatalog,
  getTvSeason,
  getPersonCredits,
  getAnimeCharacters,
  getWhatsAppEmojis,
  generateAiAvatar,
  resolveMediaQualities
} from '../controllers/mediaController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/trending', getTrending);
router.get('/search', searchMedia);
router.post('/qualities', resolveMediaQualities);
router.get('/detail/:type/:id', getMediaDetail);
router.get('/manga/chapters/:id', getMangaChapters);
router.get('/manga/pages/:chapterId', getMangaPages);
router.get('/tv/:id/season/:season_number', getTvSeason);
router.get('/person/:source/:personId', getPersonCredits);
router.get('/anime/characters', getAnimeCharacters);
router.get('/emojis', getWhatsAppEmojis);
router.post('/ai/avatar', generateAiAvatar);

router.get('/catalog/:category/:type', getCatalog);

// User Watchlist endpoints
router.get('/watchlist', authenticateToken, getWatchlist);
router.post('/watchlist', authenticateToken, addToWatchlist);
router.delete('/watchlist/:id', authenticateToken, removeFromWatchlist);

// User Continue Watching endpoints (persisted in MySQL, survives cache clearing)
router.get('/continue-watching', authenticateToken, getContinueWatching);
router.post('/continue-watching', authenticateToken, saveContinueWatching);
router.delete('/continue-watching/:id', authenticateToken, removeContinueWatching);
router.post('/continue-watching/sync', authenticateToken, syncContinueWatching);

export default router;
