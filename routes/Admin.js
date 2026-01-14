import express from 'express';
import { getAnalysis } from '../controllers/Admin.js';

const router = express.Router();

router.get("/analysis", getAnalysis);

export default router;