import express from "express";
import multer from "multer";
import { uploadKnowledgeBase, chat } from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", protect, upload.single("file"), uploadKnowledgeBase);
router.post("/message", chat); // Chat can be public or semi-public depending on use case

export default router;
