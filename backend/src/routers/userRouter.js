import express from "express";
const router = express.Router();
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

// Tất cả các routes user đều cần quyền admin
router.use(protect);
router.use(authorize("admin"));

router.route("/").post(createUser).get(getUsers);
router.route("/:id").put(updateUser).delete(deleteUser);

export default router;
