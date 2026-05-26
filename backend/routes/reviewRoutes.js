import express from 'express';
import {
  createReview,
  getToolReviews,
  toggleHelpfulVote,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:toolId', getToolReviews);
router.post('/:id/helpful', protect, toggleHelpfulVote);

export default router;
