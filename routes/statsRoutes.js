const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// נתיבי GroupBy (תמיכה בשם הישן והחדש למניעת 404)
router.get('/posts-by-type', statsController.getPostStatsByMediaType);
router.get('/posts-by-media', statsController.getPostStatsByMediaType);
router.get('/group-members-count', statsController.getGroupMemberStats);

// נתיבי חיפוש מורכב (3 פרמטרים)
router.get('/search-posts', statsController.searchPosts);
router.get('/search-groups', statsController.searchGroups);

// נתיב ראשי לנתוני הגרף ב-D3
router.get('/', statsController.getStats);

module.exports = router;