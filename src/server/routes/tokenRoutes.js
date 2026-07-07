import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getBalance,
  listPackages,
  createPurchase,
  confirmPurchase,
  createCharge,
  getPurchaseStatus,
  expirePurchase,
} from '../controllers/tokenController.js';

const router = Router();

router.use(requireAuth);

router.get('/balance', getBalance);
router.get('/packages', listPackages);
router.post('/charge', createCharge);
router.post('/purchase', createPurchase);
router.post('/confirm', confirmPurchase);
router.get('/purchase/:orderId/status', getPurchaseStatus);
router.patch('/purchase/:orderId/expire', expirePurchase);
export default router;
