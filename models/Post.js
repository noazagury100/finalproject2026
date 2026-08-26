const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: { type: String, default: 'avi_cohen' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    text: {
        type: String,
        default: 'פוסט חדש'
    },
    mediaType: {
        type: String,
        default: 'text'
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);