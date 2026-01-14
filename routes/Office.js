import express from 'express';
import { getAll, getById, add, update, remove, checkName, updatePassword } from '../controllers/Office.js';
import { office } from '../middleware/Auth.js';

const router = express.Router();

router.post("/", add);
router.put("/:id", office, update);
router.put("/password/:id", office, updatePassword);
router.delete("/:id", office, remove);

router.get("/", getAll);
router.get("/:id", getById);
router.get("/name/:name", checkName);

export default router;