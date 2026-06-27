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
  recommendSkills,
  analyzeJobMatch,
} from '../controllers/cvController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCVs);
router.post('/', createCV);
router.post('/generate-summary', generateSummary);
router.post('/recommend-skills', recommendSkills);
router.post('/analyze-job-match', analyzeJobMatch);
router.get('/:id', getCV);
router.put('/:id', updateCV);
router.delete('/:id', deleteCV);
router.post('/:id/duplicate', duplicateCV);

export default router;
