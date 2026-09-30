import express from 'express';
import { submitContactLead } from '../controllers/publicLead.controller.js';
import { publicLeadRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/leads', publicLeadRateLimiter, submitContactLead);

export default router;
