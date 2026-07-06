import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleWebhook } from '../controllers/midtransController.js';

const router = Router();

// Webhook: no auth, signature-based verification
router.post('/webhook', handleWebhook);

export default router;
