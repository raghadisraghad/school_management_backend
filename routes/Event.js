import express from 'express';
import { getAll, getById, add, update, remove, getAllByOffice } from '../controllers/Event.js';
import { office } from '../middleware/Auth.js';

const router = express.Router();

router.post("/", office, add);
router.put("/:id", office, update);
router.delete("/:id", office, remove);

router.get("/", getAll);
router.get("/:id", getById);
router.get("/office/:id", getAllByOffice);

export default router;