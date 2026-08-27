const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// נתיבי GroupBy
router.get('/posts-by-type', statsController.getPostStatsByMediaType);
router.get('/group-members-count', statsController.getGroupMemberStats);

// נתיבי חיפוש מורכב (3 פרמטרים)
router.get('/search-posts', statsController.searchPosts);
router.get('/search-groups', statsController.searchGroups);

module.exports = router;