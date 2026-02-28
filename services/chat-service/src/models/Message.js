const mongoose = require('mongoose');

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

module.exports = mongoose.model('Message', messageSchema);
