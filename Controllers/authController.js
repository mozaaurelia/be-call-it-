import connection from "../Config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// =========================
// REGISTER
// =========================
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("REQ BODY REGISTER:", req.body);

    // VALIDASI
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    // CHECK EMAIL
    const [existingUser] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    // HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // INSERT USER KE DATABASE
    const [result] = await connection.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hash, "user"]
    );

    console.log("USER BERHASIL DIBUAT:", result);

    // AMBIL DATA USER BARU
    const [newUser] = await connection.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [result.insertId]
    );

    // JWT TOKEN
    const token = jwt.sign(
      {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        role: newUser[0].role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // RESPONSE
    res.status(201).json({
      message: "Register berhasil",
      token,
      user: newUser[0],
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = rows[0];

    // CEK PASSWORD
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        message: "Password salah",
      });
    }

    // PAYLOAD JWT
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // TOKEN
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("=====", token)

    // RESPONSE
    res.json({
      message: "Login berhasil",
      token,
      user: payload,
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};