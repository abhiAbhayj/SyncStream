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
  getAnimeEpisodes
} from '../controllers/mediaController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/trending', getTrending);
router.get('/search', searchMedia);
router.get('/detail/:type/:id', getMediaDetail);
router.get('/manga/chapters/:id', getMangaChapters);
router.get('/manga/pages/:chapterId', getMangaPages);
router.get('/anime/episodes/:id', getAnimeEpisodes);

// User Watchlist endpoints
router.get('/watchlist', authenticateToken, getWatchlist);
router.post('/watchlist', authenticateToken, addToWatchlist);
router.delete('/watchlist/:id', authenticateToken, removeFromWatchlist);

export default router;
