import { Router } from 'express';
import { register } from '../controllers/authController.js';

const router = Router();

// No requireAuth — registration is public
router.post('/register', register);

export default router;
