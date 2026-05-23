import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import postRoutes from "./Routes/postRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";

dotenv.config();
dotenv.config({ path: `.env`, override: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// routes
app.get('/api', (req, res) => {
  res.send('mojaaa');
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});

// chat
app.use("/api/chats", chatRoutes);

// // notification
// import notificationRoutes from "./Routes/notificationRoutes.js";

// app.use("/api/notifications", notificationRoutes);