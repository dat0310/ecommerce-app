const mongoose = require('mongoose');
const { getConnection } = require('../../config/database');

const conversationSchema = new mongoose.Schema({
    participants: [{
        userId: { type: String, required: true },
        name: { type: String, default: '' },
        role: { type: String, enum: ['customer', 'seller'], required: true }
    }],
    lastMessage: {
        text: { type: String, default: '' },
        sender: { type: String },
        createdAt: { type: Date }
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });

conversationSchema.index({ 'participants.userId': 1 });

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: String, required: true },
    text: { type: String, default: '' },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    attachments: [{
        url: { type: String },
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number }
    }],
    productContext: {
        productId: { type: String },
        name: { type: String },
        image: { type: String },
        price: { type: Number }
    },
    read: { type: Boolean, default: false }
}, { timestamps: true });

let Conversation, Message;

const getConversationModel = () => {
    if (!Conversation) {
        const conn = getConnection('chat');
        Conversation = conn.model('Conversation', conversationSchema);
    }
    return Conversation;
};

const getMessageModel = () => {
    if (!Message) {
        const conn = getConnection('chat');
        Message = conn.model('Message', messageSchema);
    }
    return Message;
};

module.exports = { getConversationModel, getMessageModel, conversationSchema, messageSchema };
