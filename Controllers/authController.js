import connection from "../Config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// =========================
// REGISTER
// =========================
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    // 🔥 PAKSA ROLE USER
    await connection.query(
      "INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)",
      [username, email, hash, "user"]
    );

    res.json({ message: "Register berhasil" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login berhasil",
      token,
      user: payload,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
};