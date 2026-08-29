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

exports.shareToTwitter = async (req, res) => {
    try {
        const { text } = req.body;

        const externalResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Twitter API Share',
                body: text || 'פוסט מהאפליקציה',
                platform: 'Twitter'
            })
        });

        if (externalResponse.ok) {
            return res.status(200).json({
                success: true,
                message: 'הפוסט שודר בהצלחה ל-API החיצוני!'
            });
        } else {
            throw new Error('שגיאה בתקשורת מול ה-API החיצוני');
        }
    } catch (error) {
        console.error('Share Error:', error);
        res.status(500).json({ success: false, message: 'שגיאה פנימית בשרת בשיתוף' });
    }
};  