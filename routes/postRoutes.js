const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// שליפת כל הפוסטים
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בטעינת הפוסטים' });
    }
});

// יצירת פוסט חדש
router.post('/', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'נא להתחבר למערכת' });
        }

        const { content, mediaType, mediaUrl, imageUrl, videoUrl } = req.body;
        
        const postData = {
            content: content || '',
            author: req.session.user.id,
            mediaType: mediaType || 'text',
            imageUrl: imageUrl || (mediaType === 'image' ? mediaUrl : ''),
            videoUrl: videoUrl || (mediaType === 'video' ? mediaUrl : '')
        };

        const newPost = await Post.create(postData);
        const populatedPost = await Post.findById(newPost._id).populate('author', 'username');
        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה ביצירת הפוסט' });
    }
});

// הוספת לייק
router.post('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'הפוסט לא נמצא' });

        post.likesCount = (post.likesCount || 0) + 1;
        await post.save();

        res.json({ likesCount: post.likesCount });
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בעדכון הלייק' });
    }
});

// הוספת תגובה
router.post('/:id/comment', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'נא להתחבר למערכת' });
        }

        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'תגובה ריקה' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'הפוסט לא נמצא' });

        post.comments.push({
            username: req.session.user.username,
            text
        });

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בהוספת התגובה' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'הפוסט לא נמצא' });

        if (!req.session.user || post.author.toString() !== req.session.user.id) {
            return res.status(403).json({ error: 'אין הרשאה לערוך פוסט זה' });
        }

        post.content = req.body.content || post.content;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בעדכון הפוסט' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'הפוסט לא נמצא' });

        if (!req.session.user || post.author.toString() !== req.session.user.id) {
            return res.status(403).json({ error: 'אין הרשאה למחוק פוסט זה' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'הפוסט נמחק בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: 'שגיאה במחיקת הפוסט' });
    }
});

module.exports = router;