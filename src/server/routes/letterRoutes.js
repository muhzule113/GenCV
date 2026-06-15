import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
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
router.post('/generate', generateLetter);
router.post('/recommend-highlights', recommendHighlights);
router.get('/:id', getLetter);
router.put('/:id', updateLetter);
router.delete('/:id', deleteLetter);

export default router;
