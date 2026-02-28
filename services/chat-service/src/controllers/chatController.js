const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({
            'participants.userId': userId
        }).sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
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

        let conversation = await Conversation.findOne({
            'participants.userId': { $all: [userId, sellerId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    { userId, name: userName, role: 'customer' },
                    { userId: sellerId, name: sellerName || 'Seller', role: 'seller' }
                ],
                unreadCount: new Map([[userId, 0], [sellerId, 0]])
            });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: { message: 'Failed to create conversation' } });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            'participants.userId': userId
        });

        if (!conversation) {
            return res.status(404).json({ error: { message: 'Conversation not found' } });
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Mark messages as read
        await Message.updateMany(
            { conversationId, sender: { $ne: userId }, read: false },
            { $set: { read: true } }
        );

        // Reset unread count for this user
        conversation.unreadCount.set(userId, 0);
        await conversation.save();

        const total = await Message.countDocuments({ conversationId });

        res.json({
            messages: messages.reverse(),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: { message: 'Failed to fetch messages' } });
    }
};

const healthCheck = (req, res) => {
    res.json({ status: 'OK', service: 'chat-service' });
};

module.exports = { getConversations, getOrCreateConversation, getMessages, healthCheck };
