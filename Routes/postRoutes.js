import express from "express";
import multer from "multer";

import {
  getPosts,
  getAllPosts,
  createPost,
  updatePost,
  updateStatusPost,
  deletePost,
  getPostStats,
  createUser
} from "../Controllers/postController.js";

import {
  verifyToken,
  isRole
} from "../Middleware/auth.js";

const router = express.Router();

// =========================
// UPLOAD CONFIG
// =========================
const upload = multer({ dest: "uploads/" });

// =========================
// GET ALL POSTS ADMIN
// =========================
router.get(
  "/all",
  verifyToken,
  isRole("admin", "superadmin"),
  getAllPosts
);

// =========================
// GET POSTS USER LOGIN
// =========================
router.get(
  "/",
  verifyToken,
  getPosts
);

// =========================
// CREATE POST
// =========================
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  createPost
);

// =========================
// UPDATE POST
// =========================
router.put(
  "/:id",
  verifyToken,
  updatePost
);

// =========================
// UPDATE STATUS
// =========================
router.patch(
  "/status/:id",
  verifyToken,
  isRole("admin", "superadmin"),
  updateStatusPost
);

// =========================
// DELETE POST
// =========================
router.delete(
  "/:id",
  verifyToken,
  deletePost
);

// =========================
// STATS (FIX UTAMA)
// =========================
router.get(
  "/stats",
  verifyToken,
  isRole("admin", "superadmin"),
  getPostStats
);

router.post(
  "/users",
  verifyToken,
  isRole("superadmin"),
  createUser
);

export default router;