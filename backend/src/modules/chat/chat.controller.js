const chatService = require('./chat.service');

const getConversations = async (req, res) => {
    try {
        const conversations = await chatService.getConversations(req.user.id);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: { message: 'Failed to fetch conversations' } });
    }
};

const getOrCreateConversation = async (req, res) => {
    try {
        const { sellerId, sellerName } = req.body;
        const userId = req.user.id;
        const userName = req.user.name || req.user.email || 'User';

        if (!sellerId) {
            return res.status(400).json({ error: { message: 'sellerId is required' } });
        }

        const conversation = await chatService.getOrCreateConversation(userId, userName, sellerId, sellerName);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: { message: 'Failed to create conversation' } });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const result = await chatService.getMessages(conversationId, req.user.id, page, limit);

        if (!result) {
            return res.status(404).json({ error: { message: 'Conversation not found' } });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: { message: 'Failed to fetch messages' } });
    }
};

const healthCheck = (req, res) => {
    res.json({ status: 'OK', service: 'chat-service' });
};

module.exports = { getConversations, getOrCreateConversation, getMessages, healthCheck };
