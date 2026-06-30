import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getBalance,
  listPackages,
  createPurchase,
  confirmPurchase,
} from '../controllers/tokenController.js';

const router = Router();

router.use(requireAuth);

router.get('/balance', getBalance);
router.get('/packages', listPackages);
router.post('/purchase', createPurchase);
router.post('/confirm', confirmPurchase);

export default router;
