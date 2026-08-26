const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.post('/', postController.createPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);
router.delete('/:id', postController.deletePost);

module.exports = router;