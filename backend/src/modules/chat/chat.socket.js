const jwt = require('jsonwebtoken');
const { getConversationModel, getMessageModel } = require('./chat.model');
const chatService = require('./chat.service');
const axios = require('axios');
const { getProductModel } = require('../product/product.model');

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

                // AI Integration
                const isAIChat = conversation.participants.some(p => p.userId === 'gemini-ai');
                if (isAIChat && userId !== 'gemini-ai') {
                    socket.emit('userTyping', { userId: 'gemini-ai', conversationId });
                    
                    try {
                        const historyResult = await chatService.getMessages(conversationId, userId, 1, 15);
                        const aiHistory = [];
                        
                        if (historyResult && historyResult.messages) {
                            const fs = require('fs');
                            const path = require('path');

                            historyResult.messages.forEach(msg => {
                                const parts = [];
                                if (msg.text) {
                                    parts.push({ text: msg.text });
                                }
                                
                                if (msg.attachments && msg.attachments.length > 0) {
                                    msg.attachments.forEach(att => {
                                        if (att.mimeType && att.mimeType.startsWith('image/')) {
                                            try {
                                                const filePath = path.join(__dirname, '../../..', att.url);
                                                if (fs.existsSync(filePath)) {
                                                    const base64Data = fs.readFileSync(filePath, 'base64');
                                                    parts.push({
                                                        inlineData: {
                                                            mimeType: att.mimeType,
                                                            data: base64Data
                                                        }
                                                    });
                                                }
                                            } catch (e) {
                                                console.error("Failed to load image for AI:", e);
                                            }
                                        }
                                    });
                                }

                                if (parts.length === 0) {
                                    parts.push({ text: 'Sent an attachment' });
                                }

                                aiHistory.push({
                                    role: msg.sender === 'gemini-ai' ? 'model' : 'user',
                                    parts: parts
                                });
                            });
                        }
                        
                        const apiKey = process.env.GEMINI_API_KEY;
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
                        
                        // Combine consecutive messages with the same role to prevent API errors
                        const combinedHistory = [];
                        aiHistory.forEach(msg => {
                            if (combinedHistory.length > 0 && combinedHistory[combinedHistory.length - 1].role === msg.role) {
                                combinedHistory[combinedHistory.length - 1].parts.push(...msg.parts);
                            } else {
                                combinedHistory.push(msg);
                            }
                        });

                        // Fetch active products for context
                        const Product = getProductModel();
                        const products = await Product.find({ isActive: true, status: 'approved' }).select('name price description category').limit(50);
                        const productContextStr = JSON.stringify(products.map(p => ({
                            name: p.name,
                            price: p.price,
                            category: p.category,
                            description: p.description
                        })));

                        const systemPrompt = `Bạn là trợ lý ảo AI của ShopHub. Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.
CỰC KỲ QUAN TRỌNG:
1. BẠN CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan đến trang web ShopHub và các sản phẩm của chúng tôi. Nếu người dùng hỏi chủ đề ngoài lề (thời tiết, chính trị, code, bài tập...), HÃY TỪ CHỐI KHÉO LÉO.
2. KHÔNG BAO GIỜ bịa ra sản phẩm hoặc tư vấn sản phẩm không có trong dữ liệu. Dưới đây là danh sách toàn bộ sản phẩm hiện có của cửa hàng:
${productContextStr}`;

                        const body = {
                            system_instruction: {
                                parts: { text: systemPrompt }
                            },
                            contents: combinedHistory
                        };
                        
                        const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
                        const aiReply = response.data.candidates[0].content.parts[0].text;
                        
                        const { message: aiMsgObj, conversation: updatedConv } = await chatService.createMessage(
                            conversationId,
                            'gemini-ai',
                            aiReply,
                            'text'
                        );
                        
                        io.to(conversationId).emit('receiveMessage', {
                            ...aiMsgObj.toObject(),
                            conversationId
                        });
                        io.to(conversationId).emit('conversationUpdated', updatedConv);
                        
                    } catch (aiError) {
                        console.error('AI Error:', aiError.response ? aiError.response.data : aiError.message);
                        const fallbackMsg = "Xin lỗi, tôi đang gặp lỗi kết nối tới máy chủ AI. Vui lòng thử lại sau nhé! 😢";
                        const { message: aiMsgObj, conversation: updatedConv } = await chatService.createMessage(
                            conversationId,
                            'gemini-ai',
                            fallbackMsg,
                            'text'
                        );
                        io.to(conversationId).emit('receiveMessage', {
                            ...aiMsgObj.toObject(),
                            conversationId
                        });
                        io.to(conversationId).emit('conversationUpdated', updatedConv);
                    } finally {
                        socket.emit('userStopTyping', { userId: 'gemini-ai', conversationId });
                    }
                }

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
