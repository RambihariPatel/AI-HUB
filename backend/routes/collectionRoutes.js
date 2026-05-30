import express from 'express';
import {
  getCollections,
  createCollection,
  addToolToCollection,
  removeToolFromCollection,
  deleteCollection,
  toggleCollectionPublic,
  getSharedCollection,
} from '../controllers/collectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public shared collection retrieval (Accessible without authentication)
router.get('/shared/:id', getSharedCollection);

router.use(protect); // Secure subsequent collection routes

router.route('/')
  .get(getCollections)
  .post(createCollection);

router.route('/:id')
  .delete(deleteCollection);

router.put('/:id/toggle-public', toggleCollectionPublic);

router.route('/:id/tools')
  .post(addToolToCollection);

router.route('/:id/tools/:toolId')
  .delete(removeToolFromCollection);

export default router;
