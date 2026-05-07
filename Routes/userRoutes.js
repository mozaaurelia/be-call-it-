import express from "express";
import { verifyToken, isRole } from "../Middleware/auth.js";
import {
  getUsers,
  getUserById,
  updateMyProfile,
  deleteUser,
  updateUserByAdmin
} from "../controllers/userController.js";

const router = express.Router();


// =========================
// USER EDIT DIRI SENDIRI
// =========================
router.put("/me", verifyToken, updateMyProfile);


// =========================
// SUPERADMIN ONLY
// =========================
router.get("/", verifyToken, isRole("superadmin"), getUsers);

router.delete("/:id", verifyToken, isRole("superadmin"), deleteUser);

router.put("/:id", verifyToken, isRole("superadmin"), updateUserByAdmin);


// =========================
// GET USER BY ID (SELF + ADMIN + SUPERADMIN)
// =========================
router.get("/:id", verifyToken, getUserById);


export default router;