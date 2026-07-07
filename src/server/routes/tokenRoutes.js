import rateLimit from 'express-rate-limit';
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

const chargeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan pembayaran. Silakan coba lagi.' },
});

const router = Router();

router.use(requireAuth);

router.post('/charge', chargeLimiter, createCharge);
router.get('/packages', listPackages);
router.post('/purchase', createPurchase);
router.post('/confirm', confirmPurchase);
router.get('/purchase/:orderId/status', getPurchaseStatus);
router.patch('/purchase/:orderId/expire', expirePurchase);
export default router;
