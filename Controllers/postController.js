import connection from "../Config/database.js";


// =========================
// CREATE POST (AUTO PENDING)
// =========================
export const createPost = async (req, res) => {
  const { header, body, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    await connection.query(
      `INSERT INTO public_reports 
      (header, body, image, user_id, category_id, status) 
      VALUES (?,?,?,?,?, 'pending')`,
      [header, body, image, req.user.id, category_id]
    );

    res.json({ message: "Laporan dibuat (pending)" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// GET ALL POSTS (USER FILTER + STATUS FILTER)
// =========================
export const getPosts = async (req, res) => {
  try {
    let query = "SELECT * FROM public_reports";
    let params = [];

    const { status } = req.query;

    // USER hanya lihat miliknya
    if (req.user.role === "user") {
      query += " WHERE user_id=?";
      params.push(req.user.id);
    }

    // FILTER STATUS (optional)
    if (status) {
      query += req.user.role === "user"
        ? " AND status=?"
        : " WHERE status=?";
      params.push(status);
    }

    const [rows] = await connection.query(query, params);
    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// UPDATE REPORT (OWNER ONLY)
// =========================
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { header, body } = req.body;

  try {
    const [rows] = await connection.query(
      "SELECT * FROM public_reports WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    // USER hanya boleh edit miliknya sendiri
    if (req.user.role === "user" && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Tidak boleh edit laporan orang lain" });
    }

    await connection.query(
      "UPDATE public_reports SET header=?, body=? WHERE id=?",
      [header, body, id]
    );

    res.json({ message: "Laporan berhasil diupdate" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// UPDATE STATUS (ADMIN / SUPERADMIN)
// =========================
export const updateStatusPost = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  // pending / approved / rejected

  try {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const [rows] = await connection.query(
      "SELECT * FROM public_reports WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    // hanya admin / superadmin
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    await connection.query(
      "UPDATE public_reports SET status=? WHERE id=?",
      [status, id]
    );

    res.json({ message: "Status laporan diupdate" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// DELETE POST (OWNER ONLY)
// =========================
export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await connection.query(
      "SELECT * FROM public_reports WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    if (req.user.role === "user" && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: "Tidak boleh hapus laporan orang lain" });
    }

    await connection.query(
      "DELETE FROM public_reports WHERE id=?",
      [id]
    );

    res.json({ message: "Laporan berhasil dihapus" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// user cuma bisa akses data dirinya sendiri, user bisa edit data diri, 
// superadmin bisa akses user, admin, bisa edit user,
// admin,