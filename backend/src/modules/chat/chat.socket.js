const jwt = require('jsonwebtoken');
const { getConversationModel, getMessageModel } = require('./chat.model');
const chatService = require('./chat.service');

const onlineUsers = new Map();

const initializeSocket = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = {
                id: decoded.id || decoded._id || decoded.userId,
                email: decoded.email,
                role: decoded.role || 'customer'
            };
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        console.log(`User connected: ${userId}`);

        onlineUsers.set(userId, socket.id);

        socket.on('joinConversations', async () => {
            try {
                const conversations = await chatService.getConversations(userId);
                conversations.forEach(conv => {
                    socket.join(conv._id.toString());
                });
                socket.emit('conversationsJoined', conversations.map(c => c._id.toString()));
            } catch (err) {
                console.error('Error joining conversations:', err);
            }
        });

        socket.on('joinRoom', async (conversationId) => {
            try {
                const Conversation = getConversationModel();
                const Message = getMessageModel();

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    'participants.userId': userId
                });

                if (conversation) {
                    socket.join(conversationId);
                    await Message.updateMany(
                        { conversationId, sender: { $ne: userId }, read: false },
                        { $set: { read: true } }
                    );
                    conversation.unreadCount.set(userId, 0);
                    await conversation.save();
                    socket.emit('messagesRead', { conversationId });
                }
            } catch (err) {
                console.error('Error joining room:', err);
            }
        });

        socket.on('sendMessage', async (data) => {
            try {
                const { conversationId, text, messageType = 'text', attachments = [], productContext = null } = data;

                const { message, conversation } = await chatService.createMessage(
                    conversationId,
                    userId,
                    text,
                    messageType,
                    attachments,
                    productContext
                );

                io.to(conversationId).emit('receiveMessage', {
                    ...message.toObject(),
                    conversationId,
                    productContext: message.productContext || null
                });

                io.to(conversationId).emit('conversationUpdated', conversation);
            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('typing', ({ conversationId }) => {
            socket.to(conversationId).emit('userTyping', { userId, conversationId });
        });

        socket.on('stopTyping', ({ conversationId }) => {
            socket.to(conversationId).emit('userStopTyping', { userId, conversationId });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
            onlineUsers.delete(userId);
        });
    });
};

module.exports = { initializeSocket, onlineUsers };
