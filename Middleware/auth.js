import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


// =========================
// 1. VERIFY TOKEN (WAJIB)
// =========================
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ada" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Format token salah" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid" });
  }
};


// =========================
// 2. ROLE MIDDLEWARE (BARU)
// =========================
// dipakai untuk batasi akses role
// contoh: isRole("superadmin") atau isRole("admin","superadmin")

export const isRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak"
      });
    }

    next();
  };
};


// =========================
// 3. OPTIONAL: OWNER CHECK
// =========================
// untuk kasus user hanya boleh akses dirinya sendiri

export const isOwnerOrRole = (roles = []) => {
  return (req, res, next) => {
    const isOwner = req.params.id == req.user.id;
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return res.status(403).json({
        message: "Tidak diizinkan"
      });
    }

    next();
  };
};