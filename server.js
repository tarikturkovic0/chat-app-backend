const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const authController = require('./controllers/authController');
const chatRoutes = require('./routes/chatRoutes');
// const authRoutes = require('./routes/authRoutes');
const setupChatSockets = require('./sockets/chatSockets');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.use('/api', chatRoutes);
// app.use('/api', authRoutes);

app.use(express.static(path.join(__dirname, 'dist/chat-app')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/chat-app', 'index.html'));
});

setupChatSockets(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
