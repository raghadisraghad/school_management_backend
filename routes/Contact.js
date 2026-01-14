import express from 'express';
import { getAll, getById, add, update, remove } from '../controllers/Contact.js';
import { admin } from '../middleware/Auth.js';

const router = express.Router();

router.post("/", add);
router.put("/:id", admin, update);
router.delete("/:id", admin, remove);

router.get("/", admin, getAll);
router.get("/:id", admin, getById);

export default router;