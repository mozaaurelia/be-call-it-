import express from "express";
import multer from "multer";

import { verifyToken, isRole } from "../Middleware/auth.js";

import {
  getPosts,
  createPost,
  updatePost,
  updateStatusPost,
  deletePost
} from "../Controllers/postController.js";

const router = express.Router();


// =========================
// UPLOAD CONFIG
// =========================
const upload = multer({ dest: "uploads/" });


// =========================
// GET ALL POSTS
// =========================
router.get("/", verifyToken, getPosts);


// =========================
// CREATE POST (USER)
// =========================
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  createPost
);


// =========================
// UPDATE POST (use ONLY)
// =========================
router.put("/:id", verifyToken, updatePost);


// =========================
// UPDATE STATUS (ADMIN / SUPERADMIN)
// =========================
router.patch(
  "/status/:id",
  verifyToken,
  isRole("admin", "superadmin"),
  updateStatusPost
);


// =========================
// DELETE POST (user ONLY)
// =========================
router.delete("/:id", verifyToken, deletePost);


export default router;