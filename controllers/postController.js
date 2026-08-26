const Post = require('../models/Post');

// שליפת כל הפוסטים (List)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בשליפת הפוסטים' });
    }
};

// יצירת פוסט חדש (Create)
exports.createPost = async (req, res) => {
    try {
        const { author, text, mediaType, mediaUrl } = req.body;
        const newPost = new Post({ author, text, mediaType, mediaUrl });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה ביצירת הפוסט' });
    }
};