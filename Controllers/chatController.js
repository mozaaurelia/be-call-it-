import connection from "../Config/database.js";

// =========================
// GET CHAT BY REPORT
// =========================
export const getChatsByReport = async (req, res) => {
  try {

    const { reportId } = req.params;

    const [rows] = await connection.query(
      `
      SELECT chats.*, users.username
      FROM chats
      JOIN users
      ON chats.sender_id = users.id
      WHERE public_report_id = ?
      ORDER BY chats.created_at ASC
      `,
      [reportId]
    );

    res.json(rows);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================
// CREATE CHAT
// =========================
export const createChat = async (req, res) => {
  try {

    const { public_report_id, message } = req.body;

    const sender_id = req.user.id;

    if (!message) {
      return res.status(400).json({
        message: "Pesan wajib diisi",
      });
    }

    await connection.query(
      `
      INSERT INTO chats
      (
        public_report_id,
        sender_id,
        message
      )
      VALUES (?, ?, ?)
      `,
      [public_report_id, sender_id, message]
    );

    res.status(201).json({
      message: "Chat berhasil dikirim",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};