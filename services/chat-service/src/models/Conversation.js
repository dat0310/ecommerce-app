const mongoose = require('mongoose');

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

module.exports = mongoose.model('Conversation', conversationSchema);
