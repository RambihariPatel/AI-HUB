import express from 'express';
import {
  addToFavorites,
  addToHistory,
  getFavorites,
  getHistory,
  toggleSubscription,
  getSubscriptions,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/favorites', protect, addToFavorites);
router.get('/favorites', protect, getFavorites);
router.post('/history', protect, addToHistory);
router.get('/history', protect, getHistory);
router.post('/subscriptions', protect, toggleSubscription);
router.get('/subscriptions', protect, getSubscriptions);

export default router;
