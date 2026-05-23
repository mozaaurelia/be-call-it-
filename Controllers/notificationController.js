    import connection from "../Config/database.js";

// =========================
// GET NOTIFICATIONS USER
// =========================
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await connection.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("GET NOTIF ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};