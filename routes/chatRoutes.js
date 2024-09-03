const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/active-users', chatController.getActiveUsers);

router.post('/chatrooms/join', chatController.joinChatroom);

router.post('/chatrooms', chatController.createChatroom);

router.get('/chatrooms/:username', chatController.getUserChatrooms);

router.get('/chats/:identifier/messages', chatController.getChatMessages);

router.get('/previous-chats/:username', chatController.getPreviousChats);

module.exports = router;
