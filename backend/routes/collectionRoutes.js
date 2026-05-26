import express from 'express';
import {
  getCollections,
  createCollection,
  addToolToCollection,
  removeToolFromCollection,
  deleteCollection,
} from '../controllers/collectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all collection routes

router.route('/')
  .get(getCollections)
  .post(createCollection);

router.route('/:id')
  .delete(deleteCollection);

router.route('/:id/tools')
  .post(addToolToCollection);

router.route('/:id/tools/:toolId')
  .delete(removeToolFromCollection);

export default router;
