import express from "express";

import {
  getChatsByReport,
  createChat,
} from "../Controllers/chatController.js";

import { verifyToken } from "../Middleware/auth.js";

const router = express.Router();

// GET CHAT BY REPORT
router.get(
  "/:reportId",
  verifyToken,
  getChatsByReport
);

// CREATE CHAT
router.post(
  "/",
  verifyToken,
  createChat
);

export default router;