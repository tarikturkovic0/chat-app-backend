const redisClient = require('../redisClient');
const rateLimit = {};
const MESSAGE_LIMIT = 15;
const TIME_WINDOW = 60 * 1000;

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('setUsername', async (username) => {
      socket.username = username;
      try {
        await redisClient.sAdd('active_users', username);
        const users = await redisClient.sMembers('active_users');
        io.emit('updateActiveUsers', users);
      } catch (err) {
        console.error('Error setting username:', err);
      }
    });

    socket.on('disconnect', async () => {
      if (socket.username) {
        try {
          await redisClient.sRem('active_users', socket.username);
          const users = await redisClient.sMembers('active_users');
          io.emit('updateActiveUsers', users);
        } catch (err) {
          console.error('Error removing username:', err);
        }
      }
    });

    socket.on('createRoom', async (roomCode) => {
      try {
        await redisClient.sAdd('chatrooms', roomCode);
        socket.join(roomCode);
        io.to(roomCode).emit('message', 'Room created and joined');
      } catch (err) {
        console.error('Error creating room:', err);
      }
    });

    socket.on('joinRoom', async ({ roomCode, username }) => {
      try {
        const exists = await redisClient.sIsMember('chatrooms', roomCode);
        if (!exists) {
          await redisClient.sAdd('chatrooms', roomCode);
        }
        await redisClient.sAdd(`user:${username}:chatrooms`, roomCode);
        socket.join(roomCode);
        socket.emit('message', `Joined room ${roomCode}`);
      } catch (err) {
        console.error('Error joining room:', err);
      }
    });

    socket.on('sendMessage', async ({ message, chatIdentifier }) => {
      const user = socket.username;
      if (!rateLimit[user]) {
        rateLimit[user] = [];
      }
      rateLimit[user] = rateLimit[user].filter(timestamp => Date.now() - timestamp < TIME_WINDOW);

      if (rateLimit[user].length >= MESSAGE_LIMIT) {
        socket.emit('messageError', 'Message rate limit exceeded. Please wait before sending more messages.');
        return;
      }

      rateLimit[user].push(Date.now());

      try {
        const { from, content } = message;
        const timestamp = new Date().toISOString();
        const msg = JSON.stringify({ from, content, timestamp });
        await redisClient.rPush(`chat:${chatIdentifier}:messages`, msg);

        if (chatIdentifier.startsWith('user_')) {
          await redisClient.sAdd(`user:${user}:chats`, chatIdentifier);
        } else {
          await redisClient.sAdd(`user:${user}:chatrooms`, chatIdentifier);
        }
        io.to(chatIdentifier).emit('newMessage', { from, content, timestamp });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
  });
};
