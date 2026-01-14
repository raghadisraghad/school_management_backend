import express from 'express';
import { register, login, logoutUser, verifyUser, resetPassword, verifyOffice } from '../controllers/Auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verifyEmail/:token', verifyUser);
router.post('/logout', logoutUser);
router.post('/resetPassword', resetPassword);
router.post("/verifyOffice/:id", verifyOffice);

export default router;