import express from 'express';
import { getAll, getById, add, update, remove, checkUsername, updatePassword, checkUsernameExistsOnce } from '../controllers/User.js';
import { user } from '../middleware/Auth.js';

const router = express.Router();

router.post("/", user, add);
router.put("/:id", user, update);
router.put("/password/:id", user, updatePassword);
router.delete("/:id", user, remove);

router.get("/", getAll);
router.get("/:id", getById);
router.get("/username/:username", checkUsername);
router.get("/username/:username", checkUsername);
router.get("/username/:username/:id", checkUsernameExistsOnce)

export default router;