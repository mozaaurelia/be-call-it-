import connection from "../Config/database.js";
import bcrypt from "bcrypt";

// =========================
// GET ALL USERS
// =========================
export const getUsers = async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY id DESC
    `);

    res.json({
      message: "Success",
      data: rows,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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
      `
      SELECT 
        id,
        username,
        email,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id=?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    const user = rows[0];

    // superadmin boleh akses semua
    if (req.user.role === "superadmin") {
      return res.json({
        message: "Success",
        data: user
      });
    }

    // user hanya boleh akses dirinya sendiri
    if (req.user.id !== Number(id)) {
      return res.status(403).json({
        message: "Tidak boleh akses user lain"
      });
    }

    res.json({
      message: "Success",
      data: user
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


// =========================
// CREATE USER / ADMIN
// =========================
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // hanya superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Hanya superadmin"
      });
    }

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const [check] = await connection.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (check.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      `
      INSERT INTO users
      (username, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      [username, email, hashedPassword, role]
    );

    res.json({
      message: "User berhasil dibuat",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// =========================
// UPDATE PROFILE SENDIRI
// =========================
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      username,
      email,
      profileImage
    } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: "Username dan email wajib diisi"
      });
    }

    await connection.query(
      `
      UPDATE users 
      SET 
        username=?,
        email=?,
        profile_image=?,
        updated_at=NOW()
      WHERE id=?
      `,
      [username, email, profileImage, userId]
    );

    res.json({
      message: "Profile diupdate",
      data: {
        id: userId,
        username,
        email,
        profileImage
      }
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


// =========================
// UPDATE USER BY SUPERADMIN
// =========================
export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      username,
      email,
      password,
      role
    } = req.body;

    // hanya superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Hanya superadmin"
      });
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
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    // kalau password diisi → update password
    if (password && password.trim() !== "") {

      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.query(
        `
        UPDATE users
        SET 
          username=?,
          email=?,
          password=?,
          role=?,
          updated_at=NOW()
        WHERE id=?
        `,
        [username, email, hashedPassword, role, id]
      );

    } else {

      // kalau password kosong → password lama tetap
      await connection.query(
        `
        UPDATE users
        SET 
          username=?,
          email=?,
          role=?,
          updated_at=NOW()
        WHERE id=?
        `,
        [username, email, role, id]
      );
    }

    res.json({
      message: "User berhasil diupdate"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};


// =========================
// DELETE USER
// =========================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // hanya superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Hanya superadmin"
      });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    await connection.query(
      "DELETE FROM users WHERE id=?",
      [id]
    );

    res.json({
      message: "User berhasil dihapus"
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};