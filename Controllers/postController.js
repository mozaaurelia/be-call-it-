import connection from "../Config/database.js";


// =========================
// CREATE POST
// =========================
export const createPost = async (req, res) => {
  const { header, body, category_id, location } = req.body;

  const image = req.file ? req.file.filename : null;

  try {
    await connection.query(
      `INSERT INTO public_reports
      (header, body, image, location, user_id, category_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        header,
        body,
        image,
        location || null,
        req.user.id,
        category_id || null,
      ]
    );

    return res.status(200).json({
      message: "Laporan berhasil dibuat",
    });

  } catch (err) {

    console.error("CREATE POST ERROR:", err.message);

    return res.status(500).json({
      message: err.message,
    });
  }
};


// create user 
export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    await connection.query(
      `INSERT INTO users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, password, role || "user"]
    );

    return res.status(201).json({
      message: "User berhasil dibuat",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// GET POSTS USER LOGIN
// =========================
export const getPosts = async (req, res) => {

  try {

    // VALIDASI USER
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const [rows] = await connection.query(
      `
      SELECT 
        pr.id,
        pr.header,
        pr.body,
        pr.image,
        pr.location,
        pr.status,
        pr.user_id,
        pr.created_at,
        IFNULL(c.category_name, '') AS category_name
      FROM public_reports pr
      LEFT JOIN categories c 
        ON pr.category_id = c.id
      WHERE pr.user_id = ?
      ORDER BY pr.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json(
      Array.isArray(rows) ? rows : []
    );

  } catch (error) {

    console.error("GET POSTS ERROR:", error);

    return res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};

// =========================
// GET ALL POSTS (ADMIN / SUPERADMIN)
// =========================

export const getAllPosts = async (req, res) => {
  try {

    const [results] = await connection.query(`
      SELECT
        public_reports.*,
        users.username,
        categories.category_name
      FROM public_reports

      LEFT JOIN users
      ON public_reports.user_id = users.id

      LEFT JOIN categories
      ON public_reports.category_id = categories.id

      ORDER BY public_reports.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      data: results,
    });

  } catch (error) {

    console.error("GET ALL POSTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get posts",
      error: error.message,
    });
  }
};


// =========================
// UPDATE POST
// =========================
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { header, body, category_id, location } = req.body;

  try {
    // cek data exist
    const [rows] = await connection.query(
      "SELECT * FROM public_reports WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan",
      });
    }

    // cek hak akses (user cuma boleh edit miliknya sendiri)
    if (req.user.role === "user" && rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Tidak boleh edit laporan orang lain",
      });
    }

    // update data
    await connection.query(
      `
      UPDATE public_reports 
      SET header = ?, 
          body = ?, 
          category_id = ?, 
          location = ?
      WHERE id = ?
      `,
      [
        header,
        body,
        category_id || rows[0].category_id,
        location || rows[0].location,
        id
      ]
    );

    return res.json({
      message: "Laporan berhasil diupdate",
    });

  } catch (err) {
    console.error("UPDATE POST ERROR:", err.message);

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// =========================
// UPDATE STATUS
// =========================
export const updateStatusPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // VALIDASI STATUS
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        message: "Status tidak valid",
      });
    }

    // UPDATE DATABASE
    await connection.query(
  `
  UPDATE public_reports
  SET status = ?
  WHERE id = ?
  `,
  [status, id]
);

const [updatedPost] = await connection.query(
  `
  SELECT * FROM public_reports
  WHERE id = ?
  `,
  [id]
);

    res.status(200).json({
      message: `Post berhasil di-${status}`,
      data: updatedPost[0],
    });

  } catch (error) {
    console.log("UPDATE STATUS ERROR:", error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// =========================
// DELETE POST
// =========================
export const deletePost = async (req, res) => {

  const { id } = req.params;

  try {

    const [rows] = await connection.query(
      "SELECT * FROM public_reports WHERE id=?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan",
      });
    }

    if (
      req.user.role === "user" &&
      rows[0].user_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "Tidak boleh hapus laporan orang lain",
      });
    }


    // INI CODE YANG BARU DI TAMBAHIN
    // user hanya boleh hapus laporan pending
if (
  req.user.role === "user" &&
  rows[0].status.toLowerCase() !== "pending"
) {
  return res.status(403).json({
    message: "Hanya laporan pending yang boleh dihapus",
  });
}

    await connection.query(
      "DELETE FROM public_reports WHERE id=?",
      [id]
    );

    return res.json({
      message: "Laporan berhasil dihapus",
    });

  } catch (err) {

    console.error("DELETE ERROR:", err.message);

    return res.status(500).json({
      message: err.message,
    });
  }
};


export const getPostStats = async (req, res) => {
  try {
    // validasi role
    if (
      !req.user ||
      !["admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({
        message: "Tidak diizinkan",
      });
    }

    const [rows] = await connection.query(`
      SELECT 
        COUNT(*) AS totalReports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM public_reports
    `);

    return res.status(200).json({
      data: rows[0],
    });

  } catch (error) {
    console.error("GET POST STATS ERROR:", error);

    return res.status(500).json({
      message: "Gagal ambil stats",
      error: error.message,
    });
  }
};