import express from 'express';
import { getAll, getById, add, update, remove, getAllByOffice } from '../controllers/Join.js';
import { admin, office, user} from '../middleware/Auth.js';

const router = express.Router();

router.post("/", user, add);
router.put("/:id", update);
router.delete("/:id", admin, remove);

router.get("/", office, getAll);
router.get("/:id", office, getById);
router.get("/office/:id", office, getAllByOffice);

export default router;