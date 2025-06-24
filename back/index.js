const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

// Optional: Load .env file if exists
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/livechat";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit process if DB fails
  });

// 💬 Message schema
const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// 👤 User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// �� Allowed usernames
// const ALLOWED_USERNAMES = ['Alice', 'Bob'];

// 🌐 API routes
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📝 Register endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    // Prevent duplicate registration
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: "Username already registered" });
    }
    const user = new User({ username, password });
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔑 Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Online users tracking
const onlineUsers = {};

// ⚡ Socket.IO for real-time chat
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User login event to track online users
  socket.on("user online", (username) => {
    onlineUsers[socket.id] = username;
    io.emit("online users", Object.values(onlineUsers));
  });

  // User disconnects
  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("online users", Object.values(onlineUsers));
    console.log("🚪 User disconnected:", socket.id);
  });

  // Join private room
  socket.on("join room", (roomId) => {
    socket.join(roomId);
  });

  // Private chat message
  socket.on("private message", async ({ roomId, msg }) => {
    try {
      const message = new Message(msg);
      await message.save();
      io.to(roomId).emit("private message", message);
    } catch (err) {
      console.error("💥 Error saving message:", err.message);
    }
  });

  // Delete message (optional, for private rooms)
  socket.on("delete message", async (id) => {
    try {
      await Message.findByIdAndDelete(id);
      io.emit("delete message", id);
    } catch (err) {
      console.error("💥 Error deleting message:", err.message);
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
