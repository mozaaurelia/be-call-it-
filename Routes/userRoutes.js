import express from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateMyProfile,
  updateUserByAdmin,
  deleteUser
} from "../Controllers/userController.js";

import {
  verifyToken,
  isRole
} from "../Middleware/auth.js";

const router = express.Router();


// =========================
// GET ALL USERS
// ADMIN + SUPERADMIN
// =========================
router.get(
  "/",
  verifyToken,
  isRole("admin", "superadmin"),
  getUsers
);


// =========================
// GET USER BY ID
// SUPERADMIN + USER SENDIRI
// =========================
router.get(
  "/:id",
  verifyToken,
  getUserById
);


// =========================
// CREATE USER / ADMIN
// SUPERADMIN ONLY
// =========================
router.post(
  "/",
  verifyToken,
  isRole("superadmin"),
  createUser
);


// =========================
// UPDATE PROFILE SENDIRI
// =========================
router.put(
  "/me",
  verifyToken,
  updateMyProfile
);


// =========================
// UPDATE USER BY SUPERADMIN
// =========================
router.put(
  "/:id",
  verifyToken,
  isRole("superadmin"),
  updateUserByAdmin
);


// =========================
// DELETE USER
// SUPERADMIN ONLY
// =========================
router.delete(
  "/:id",
  verifyToken,
  isRole("superadmin"),
  deleteUser
);

export default router;
