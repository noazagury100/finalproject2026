const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    content: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    mediaType: { type: String, default: 'text' },
    likesCount: { type: Number, default: 0 },
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);