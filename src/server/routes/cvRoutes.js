import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireToken } from '../middleware/tokenMiddleware.js';
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
  toggleShare,
  getSharedCV,
  parseOCRText,
} from '../controllers/cvController.js';

const router = Router();

// Public route — no auth
router.get('/shared/:token', getSharedCV);

router.use(requireAuth);

router.get('/', listCVs);
router.post('/', createCV);
router.post('/generate-summary', requireToken, generateSummary);
router.post('/recommend-skills', requireToken, recommendSkills);
router.post('/analyze-job-match', requireToken, analyzeJobMatch);
router.post('/parse-ocr', requireToken, parseOCRText);
router.get('/:id', getCV);
router.put('/:id', updateCV);
router.delete('/:id', deleteCV);
router.post('/:id/duplicate', duplicateCV);
router.post('/:id/share', toggleShare);

export default router;
