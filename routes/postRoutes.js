const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// נתיבים כלליים
router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);

// 🛑 חייב להופיע לפני הלייק, התגובה והמחיקה שמכילים :id!
router.post('/share-twitter', postController.shareToTwitter);

// נתיבי ID
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);
router.delete('/:id', postController.deletePost);

module.exports = router;