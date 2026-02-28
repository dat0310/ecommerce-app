const jwt = require('jsonwebtoken');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const onlineUsers = new Map();

const initializeSocket = (io) => {
    // Authenticate socket connections via JWT
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

        // Join all conversations this user is part of
        socket.on('joinConversations', async () => {
            try {
                const conversations = await Conversation.find({ 'participants.userId': userId });
                conversations.forEach(conv => {
                    socket.join(conv._id.toString());
                });
                socket.emit('conversationsJoined', conversations.map(c => c._id.toString()));
            } catch (err) {
                console.error('Error joining conversations:', err);
            }
        });

        // Join a specific conversation room
        socket.on('joinRoom', async (conversationId) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    'participants.userId': userId
                });

                if (conversation) {
                    socket.join(conversationId);
                    // Mark messages as read
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

        // Handle sending a message
        socket.on('sendMessage', async (data) => {
            try {
                const { conversationId, text, messageType = 'text', attachments = [], productContext = null } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    'participants.userId': userId
                });

                if (!conversation) {
                    return socket.emit('error', { message: 'Conversation not found' });
                }

                const msgData = {
                    conversationId,
                    sender: userId,
                    text: text || '',
                    messageType,
                    attachments
                };
                if (productContext) {
                    msgData.productContext = productContext;
                }
                const message = await Message.create(msgData);

                // Update conversation's last message
                const displayText = messageType === 'image' ? '📷 Image' :
                    messageType === 'file' ? '📎 File' : text;

                conversation.lastMessage = {
                    text: displayText,
                    sender: userId,
                    createdAt: message.createdAt
                };

                // Increment unread for the other participant
                conversation.participants.forEach(p => {
                    if (p.userId !== userId) {
                        const current = conversation.unreadCount.get(p.userId) || 0;
                        conversation.unreadCount.set(p.userId, current + 1);
                    }
                });

                await conversation.save();

                // Broadcast to the room
                io.to(conversationId).emit('receiveMessage', {
                    ...message.toObject(),
                    conversationId,
                    productContext: message.productContext || null
                });

                // Also emit conversation update to all participants for sidebar refresh
                io.to(conversationId).emit('conversationUpdated', conversation);

            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicators
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
