import express from 'express';
import {
  getNotifications,
  markAsRead,
  clearNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all notification routes

router.route('/')
  .get(getNotifications)
  .delete(clearNotifications);

router.route('/:id/read')
  .put(markAsRead);

export default router;
