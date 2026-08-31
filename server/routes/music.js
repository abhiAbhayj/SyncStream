import express from 'express';
import {
  getTrendingMusic,
  searchMusic,
  getMusicCharts,
  getSongDetails
} from '../controllers/musicController.js';

const router = express.Router();

// GET /api/music/trending?language=hindi&page=1
router.get('/trending', getTrendingMusic);

// GET /api/music/search?query=kesariya&language=hindi&page=1
router.get('/search', searchMusic);

// GET /api/music/charts
router.get('/charts', getMusicCharts);

// GET /api/music/song/:id
router.get('/song/:id', getSongDetails);

export default router;
