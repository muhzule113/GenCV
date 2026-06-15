import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listCVs,
  createCV,
  getCV,
  updateCV,
  deleteCV,
  duplicateCV,
  generateSummary,
} from '../controllers/cvController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCVs);
router.post('/', createCV);
router.post('/generate-summary', generateSummary);
router.get('/:id', getCV);
router.put('/:id', updateCV);
router.delete('/:id', deleteCV);
router.post('/:id/duplicate', duplicateCV);

export default router;
