const redisClient = require('../redisClient');

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await redisClient.sMembers('active_users');
    res.json(users);
  } catch (error) {
    console.error('Failed to retrieve active users:', error.message);
    res.status(500).json({ error: 'Failed to retrieve active users' });
  }
};

exports.joinChatroom = async (req, res) => {
  const { roomCode, username } = req.body;
  try {
    const exists = await redisClient.sIsMember('chatrooms', roomCode);
    if (exists) {
      await redisClient.sAdd(`user:${username}:chatrooms`, roomCode);
      res.status(200).json({ message: 'Joined chatroom' });
    } else {
      res.status(404).json({ error: 'Chatroom not found' });
    }
  } catch (error) {
    console.error('Error joining chatroom:', error);
    res.status(500).json({ error: 'Failed to join chatroom' });
  }
};

exports.createChatroom = async (req, res) => {
  const { roomCode, username } = req.body;
  try {
    await redisClient.sAdd('chatrooms', roomCode);
    await redisClient.sAdd(`user:${username}:chatrooms`, roomCode);
    res.status(201).json({ message: 'Chatroom created' });
  } catch (error) {
    console.error('Error creating chatroom:', error);
    res.status(500).json({ error: 'Failed to create chatroom' });
  }
};

exports.getUserChatrooms = async (req, res) => {
  const { username } = req.params;
  try {
    const chatrooms = await redisClient.sMembers(`user:${username}:chatrooms`);
    res.json(chatrooms);
  } catch (error) {
    console.error('Error retrieving user chatrooms:', error);
    res.status(500).json({ error: 'Failed to retrieve chatrooms' });
  }
};

exports.getChatMessages = async (req, res) => {
  const { identifier } = req.params;
  try {
    const messages = await redisClient.lRange(`chat:${identifier}:messages`, 0, -1);
    res.json(messages.map(message => JSON.parse(message)));
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
};

exports.getPreviousChats = async (req, res) => {
  const username = req.params.username;
  try {
    const userChats = await redisClient.sMembers(`user:${username}:chats`);
    const roomChats = await redisClient.sMembers(`user:${username}:chatrooms`);
    res.json({ userChats, roomChats });
  } catch (err) {
    console.error('Error fetching previous chats:', err);
    res.status(500).send('Server error');
  }
};
