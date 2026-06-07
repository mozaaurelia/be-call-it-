import db from "../config/database.js";

// =========================
// GET ALL CATEGORIES
// =========================
export const getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM categories ORDER BY created_at DESC"
        );

        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// =========================
// GET CATEGORY BY ID
// =========================
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM categories WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Kategori tidak ditemukan" });
        }

        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// =========================
// CREATE CATEGORY
// =========================
export const createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name || category_name.trim() === "") {
            return res
                .status(400)
                .json({ success: false, message: "Nama kategori wajib diisi" });
        }

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE category_name = ?",
            [category_name.trim()]
        );

        if (existing.length > 0) {
            return res
                .status(409)
                .json({ success: false, message: "Kategori sudah ada" });
        }

        const [result] = await db.query(
            "INSERT INTO categories (category_name) VALUES (?)",
            [category_name.trim()]
        );

        const [newCategory] = await db.query(
            "SELECT * FROM categories WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Kategori berhasil dibuat",
            data: newCategory[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// =========================
// UPDATE CATEGORY
// =========================
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;

        if (!category_name || category_name.trim() === "") {
            return res
                .status(400)
                .json({ success: false, message: "Nama kategori wajib diisi" });
        }

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Kategori tidak ditemukan" });
        }

        const [duplicate] = await db.query(
            "SELECT id FROM categories WHERE category_name = ? AND id != ?",
            [category_name.trim(), id]
        );

        if (duplicate.length > 0) {
            return res
                .status(409)
                .json({ success: false, message: "Nama kategori sudah digunakan" });
        }

        await db.query(
            "UPDATE categories SET category_name = ? WHERE id = ?",
            [category_name.trim(), id]
        );

        const [updated] = await db.query(
            "SELECT * FROM categories WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Kategori berhasil diupdate",
            data: updated[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// =========================
// DELETE CATEGORY
// =========================
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Kategori tidak ditemukan" });
        }

        const [usedInReports] = await db.query(
            "SELECT COUNT(*) as count FROM public_reports WHERE category_id = ?",
            [id]
        );

        if (usedInReports[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${usedInReports[0].count} laporan`,
            });
        }

        await db.query("DELETE FROM categories WHERE id = ?", [id]);

        res.json({ success: true, message: "Kategori berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};