import express from 'express';
import {
  getTools,
  getToolById,
  getTrendingTools,
  getMostFavoritedTools,
  compareTools,
  createTool,
  updateTool,
  deleteTool,
  submitTool,
  getPendingTools,
  approveTool,
  getMySubmissions,
  createToolAlert,
} from '../controllers/toolController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTools);
router.get('/trending', getTrendingTools);
router.get('/favorites-trending', getMostFavoritedTools);
router.get('/compare', compareTools);
router.post('/submit', protect, submitTool);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/pending', protect, admin, getPendingTools);
router.put('/:id/approve', protect, admin, approveTool);
router.post('/:id/alerts', protect, createToolAlert);
router.get('/:id', getToolById);

// Admin routes
router.post('/', protect, admin, createTool);
router.put('/:id', protect, admin, updateTool);
router.delete('/:id', protect, admin, deleteTool);

export default router;
