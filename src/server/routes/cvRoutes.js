import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireToken } from '../middleware/tokenMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createCVSchema, updateCVSchema, analyzeJobMatchSchema, generateSummarySchema } from '../validators/cvValidator.js';
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
router.post('/', validate(createCVSchema), createCV);
router.post('/generate-summary', validate(generateSummarySchema), requireToken, generateSummary);
router.post('/recommend-skills', requireToken, recommendSkills);
router.post('/analyze-job-match', validate(analyzeJobMatchSchema), requireToken, analyzeJobMatch);
router.post('/parse-ocr', requireToken, parseOCRText);
router.get('/:id', getCV);
router.put('/:id', validate(updateCVSchema), updateCV);
router.delete('/:id', deleteCV);
router.post('/:id/duplicate', duplicateCV);
router.post('/:id/share', toggleShare);

export default router;
