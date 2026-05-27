import express from 'express';
import {
  getToolkits,
  getToolkitById,
  createToolkit,
  updateToolkit,
  deleteToolkit,
  seedToolkits,
} from '../controllers/toolkitController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getToolkits);
router.get('/:id', getToolkitById);

// Admin only
router.post('/seed', protect, admin, seedToolkits);
router.post('/', protect, admin, createToolkit);
router.put('/:id', protect, admin, updateToolkit);
router.delete('/:id', protect, admin, deleteToolkit);

export default router;
