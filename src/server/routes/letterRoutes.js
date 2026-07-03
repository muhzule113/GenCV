import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireToken } from '../middleware/tokenMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createLetterSchema, updateLetterSchema, generateLetterSchema } from '../validators/letterValidator.js';
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
router.post('/', validate(createLetterSchema), createLetter);
router.post('/generate', validate(generateLetterSchema), requireToken, generateLetter);
router.post('/recommend-highlights', requireToken, recommendHighlights);
router.get('/:id', getLetter);
router.put('/:id', validate(updateLetterSchema), updateLetter);
router.delete('/:id', deleteLetter);

export default router;
