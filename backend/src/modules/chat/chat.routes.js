const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/authMiddleware');
const chatController = require('./chat.controller');
const { upload, uploadFiles } = require('./chat.upload');

router.get('/conversations', authenticateToken, chatController.getConversations);
router.post('/conversations', authenticateToken, chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authenticateToken, chatController.getMessages);
router.post('/upload', authenticateToken, upload.array('files', 5), uploadFiles);
router.get('/health', chatController.healthCheck);

module.exports = router;
