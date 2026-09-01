const Post = require('../models/Post');
const User = require('../models/User');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { text, mediaType, mediaUrl } = req.body;

        let author = await User.findOne();
        if (!author) {
            author = await User.create({
                username: 'avi_cohen',
                password: 'password123'
            });
        }

        const newPost = await Post.create({
            author: author._id,
            text: (text && text.trim() !== '') ? text : 'פוסט חדש',
            mediaType: mediaType || 'text',
            mediaUrl: mediaUrl || ''
        });

        const populatedPost = await Post.findById(newPost._id).populate('author', 'username');
        return res.status(201).json(populatedPost);
    } catch (err) {
        console.error("❌ Create Post Error:", err);
        return res.status(500).json({ error: err.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'פוסט לא נמצא' });

        post.likesCount += 1;
        await post.save();

        res.json({ likesCount: post.likesCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'חובה להזין טקסט לתגובה' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'פוסט לא נמצא' });

        post.comments.push({ username: 'avi_cohen', text });
        await post.save();

        const populatedPost = await Post.findById(post._id).populate('author', 'username');
        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'הפוסט לא נמצא' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'הפוסט נמחק בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------------------------------------------------
// פונקציות חיפוש
// -------------------------------------------------------------

// חיפוש לפי מילת מפתח וסוג מדיה
exports.searchPostsByFilter = async (req, res) => {
    try {
        const { keyword, mediaType } = req.query;
        let query = {};

        if (keyword && keyword.trim() !== '') {
            query.$or = [
                { text: { $regex: keyword.trim(), $options: 'i' } },
                { content: { $regex: keyword.trim(), $options: 'i' } }
            ];
        }
        if (mediaType && mediaType.trim() !== '') {
            query.mediaType = mediaType.trim();
        }

        const posts = await Post.find(query).populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// חיפוש לפי טווח תאריכים
exports.searchPostsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateQuery = {};

        if (startDate && startDate.trim() !== '') {
            dateQuery.$gte = new Date(startDate);
        }
        if (endDate && endDate.trim() !== '') {
            let end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery.$lte = end;
        }

        let query = {};
        if (Object.keys(dateQuery).length > 0) {
            query.createdAt = dateQuery;
        }

        const posts = await Post.find(query).populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};