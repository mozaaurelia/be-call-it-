import express from "express";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../Controllers/categoryController.js";

import { verifyToken, isRole } from "../Middleware/auth.js";

const router = express.Router();

// Public - siapapun bisa lihat kategori
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected - hanya admin & superadmin
router.post("/", verifyToken, isRole("admin", "superadmin"), createCategory);
router.put("/:id", verifyToken, isRole("admin", "superadmin"), updateCategory);
router.delete("/:id", verifyToken, isRole("admin", "superadmin"), deleteCategory);

export default router;