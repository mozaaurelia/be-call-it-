import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// =========================
// VERIFY TOKEN
// =========================

export const verifyToken = (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token tidak ada",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token tidak valid",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    console.log("VERIFY TOKEN ERROR:", err);

    return res.status(403).json({
      message: "Token tidak valid",
    });
  }
};

// =========================
// ROLE MIDDLEWARE
// =========================
export const isRole = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak",
      });
    }

    next();
  };
};