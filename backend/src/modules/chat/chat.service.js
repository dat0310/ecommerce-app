const { getConversationModel, getMessageModel } = require('./chat.model');

const getConversations = async (userId) => {
    const Conversation = getConversationModel();
    return await Conversation.find({
        'participants.userId': userId
    }).sort({ updatedAt: -1 });
};

const getOrCreateConversation = async (userId, userName, sellerId, sellerName) => {
    const Conversation = getConversationModel();

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

    return conversation;
};

const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
    const Conversation = getConversationModel();
    const Message = getMessageModel();

    const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': userId
    });

    if (!conversation) return null;

    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Mark messages as read
    await Message.updateMany(
        { conversationId, sender: { $ne: userId }, read: false },
        { $set: { read: true } }
    );

    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    const total = await Message.countDocuments({ conversationId });

    return {
        messages: messages.reverse(),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
};

const createMessage = async (conversationId, senderId, text, messageType = 'text', attachments = [], productContext = null) => {
    const Conversation = getConversationModel();
    const Message = getMessageModel();

    const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': senderId
    });

    if (!conversation) throw new Error('Conversation not found');

    const msgData = {
        conversationId,
        sender: senderId,
        text: text || '',
        messageType,
        attachments
    };
    if (productContext) {
        msgData.productContext = productContext;
    }

    const message = await Message.create(msgData);

    const displayText = messageType === 'image' ? '📷 Image' :
        messageType === 'file' ? '📎 File' : text;

    conversation.lastMessage = {
        text: displayText,
        sender: senderId,
        createdAt: message.createdAt
    };

    conversation.participants.forEach(p => {
        if (p.userId !== senderId) {
            const current = conversation.unreadCount.get(p.userId) || 0;
            conversation.unreadCount.set(p.userId, current + 1);
        }
    });

    await conversation.save();

    return { message, conversation };
};

module.exports = {
    getConversations,
    getOrCreateConversation,
    getMessages,
    createMessage
};
