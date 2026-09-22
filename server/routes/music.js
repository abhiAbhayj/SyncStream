import express from 'express';
import {
  getTrendingMusic,
  searchMusic,
  getMusicCharts,
  getSongDetails,
  getLyrics,
  getUserPlaylists,
  createPlaylist,
  deletePlaylist,
  getPlaylistSongs,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getUserFavorites,
  addFavoriteSong,
  removeFavoriteSong
} from '../controllers/musicController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/music/trending?language=hindi&page=1
router.get('/trending', getTrendingMusic);

// GET /api/music/search?query=kesariya&category=movie&language=hindi&page=1
router.get('/search', searchMusic);

// GET /api/music/charts
router.get('/charts', getMusicCharts);

// GET /api/music/song/:id
router.get('/song/:id', getSongDetails);

// GET /api/music/lyrics?title=...&artist=...&duration=...&songId=...
router.get('/lyrics', getLyrics);

// ── User Playlists Routes ──
router.get('/playlists', authenticateToken, getUserPlaylists);
router.post('/playlists', authenticateToken, createPlaylist);
router.delete('/playlists/:id', authenticateToken, deletePlaylist);
router.get('/playlists/:id/songs', authenticateToken, getPlaylistSongs);
router.post('/playlists/:id/songs', authenticateToken, addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', authenticateToken, removeSongFromPlaylist);

// ── User Favorite Songs (Liked Library) Routes ──
router.get('/favorites', authenticateToken, getUserFavorites);
router.post('/favorites', authenticateToken, addFavoriteSong);
router.delete('/favorites/:songId', authenticateToken, removeFavoriteSong);

export default router;
