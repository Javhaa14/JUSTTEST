const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

// Optional: Load .env file if exists
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/livechat';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1); // Exit process if DB fails
    });

// 💬 Message schema
const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// 🌐 API routes
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ⚡ Socket.IO for real-time chat
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('chat message', async (msg) => {
        try {
            const message = new Message(msg);
            await message.save();
            io.emit('chat message', message);
        } catch (err) {
            console.error('💥 Error saving message:', err.message);
        }
    });

    socket.on('delete message', async (id) => {
        try {
            await Message.findByIdAndDelete(id);
            io.emit('delete message', id);
        } catch (err) {
            console.error('💥 Error deleting message:', err.message);
        }
    });

    socket.on('disconnect', () => { console.log('🚪 User disconnected:', socket.id);
    });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
