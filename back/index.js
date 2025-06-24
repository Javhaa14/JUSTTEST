const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

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

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/livechat';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Message schema
const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// REST endpoint to get messages
app.get('/messages', async (req, res) => {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    res.json(messages);
});

// REST endpoint to delete a message by ID
app.delete('/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Socket.IO for live chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('chat message', async (msg) => {
        const message = new Message(msg);
        await message.save();
        io.emit('chat message', message);
    });

    // Handle message deletion
    socket.on('delete message', async (id) => {
        await Message.findByIdAndDelete(id);
        io.emit('delete message', id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 