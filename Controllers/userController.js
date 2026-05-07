import connection from "../Config/database.js";

// =========================
// GET ALL USERS (SUPERADMIN ONLY)
// =========================
export const getUsers = async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT id, username, email, role, created_at, updated_at FROM users"
    );

    res.json({
      message: "Success",
      data: rows
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// GET USER BY ID
// (SUPERADMIN + USER SENDIRI)
// =========================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await connection.query(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = rows[0];

    // superadmin boleh semua
    if (req.user.role === "superadmin") {
      return res.json({ message: "Success", data: user });
    }

    // user hanya boleh dirinya sendiri
    if (req.user.id !== Number(id)) {
      return res.status(403).json({ message: "Tidak boleh akses user lain" });
    }

    res.json({ message: "Success", data: user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// UPDATE PROFILE SENDIRI
// =========================
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: "Username dan email wajib diisi"
      });
    }

    await connection.query(
      "UPDATE users SET username=?, email=?, updated_at=NOW() WHERE id=?",
      [username, email, userId]
    );

    res.json({
      message: "Profile diupdate",
      data: {
        id: userId,
        username,
        email
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// UPDATE USER BY SUPERADMIN
// =========================
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Hanya superadmin" });
    }

    if (!username || !email || !role) {
      return res.status(400).json({
        message: "Semua field wajib diisi"
      });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    await connection.query(
      "UPDATE users SET username=?, email=?, role=?, updated_at=NOW() WHERE id=?",
      [username, email, role, id]
    );

    res.json({ message: "User berhasil diupdate" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// DELETE USER (SUPERADMIN ONLY)
// =========================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Hanya superadmin" });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    await connection.query(
      "DELETE FROM users WHERE id=?",
      [id]
    );

    res.json({ message: "User dihapus" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};