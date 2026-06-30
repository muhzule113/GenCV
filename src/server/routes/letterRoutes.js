import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireToken } from '../middleware/tokenMiddleware.js';
import {
  listLetters,
  createLetter,
  getLetter,
  updateLetter,
  deleteLetter,
  generateLetter,
  recommendHighlights,
} from '../controllers/letterController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listLetters);
router.post('/', createLetter);
router.post('/generate', requireToken, generateLetter);
router.post('/recommend-highlights', requireToken, recommendHighlights);
router.get('/:id', getLetter);
router.put('/:id', updateLetter);
router.delete('/:id', deleteLetter);

export default router;
