const express = require('express');
const http = require('http');
const cors = require('cors');
const authController = require('./controllers/authController');
const { Server } = require('socket.io');
const chatRoutes = require('./routes/chatRoutes');
const setupChatSockets = require('./sockets/chatSockets');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.use('/api', chatRoutes);

setupChatSockets(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
