import express from 'express';
import dotenv from 'dotenv';
import { avatarUpload, officeAudioUpload, officeImageUpload, officeVideoUpload, officePvUpload, adminPvUpload } from '../middleware/Pictures.js'
import { addAvatar, addEventPostAudio, addEventPostImage, addEventPostVideo, getAvatar, getEventPostAudio, getEventPostImage, getEventPostVideo, addOfficeBackground, addPv, getPv, getPvAdmin } from '../controllers/Pictures.js';
import { all, admin, office } from '../middleware/Auth.js';

dotenv.config({ path: './.env' });
const router = express.Router();

router.post("/upload-avatar/:userId", all, avatarUpload.single('avatar'), addAvatar);
router.post("/upload-pv/:userId", admin, adminPvUpload.single('pv'), addPv);
router.post("/upload-office/:userId", office, avatarUpload.single('background'), addOfficeBackground);
router.post("/upload-office-image/:userId", office, officeImageUpload.array('picture'), addEventPostImage);
router.post("/upload-office-video/:userId", office, officeVideoUpload.array('video'), addEventPostVideo);
router.post("/upload-office-audio/:userId", office, officeAudioUpload.single('audio'), addEventPostAudio);
router.post("/upload-office-pv/:userId", office, officePvUpload.single('pv'), addPv);

router.get("/avatar/:id/:url", getAvatar);
router.get("/office-images/:id/:url", getEventPostImage);
router.get("/office-videos/:id/:url", getEventPostVideo);
router.get("/office-audios/:id/:url", getEventPostAudio);
router.get("/office-pv/:id/:url", all, getPv);
router.get("/pv/:id/:url", all, getPvAdmin);

export default router;
