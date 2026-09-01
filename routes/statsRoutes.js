const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// החזרת התפלגות פוסטים לפי סוג מדיה (מתאים לקריאה מ-stats.js)
router.get('/posts-by-type', async (req, res) => {
    try {
        const stats = await Post.aggregate([
            {
                $group: {
                    _id: '$mediaType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // מיפוי לפורמט ש-D3 מצפה לקבל
        const result = stats.map(item => ({
            mediaType: item._id || 'text',
            count: item.count
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בטעינת סטטיסטיקות מדיה' });
    }
});

// נתיב כללי לסטטיסטיקות מעורבות שבועית (לפירוט בפרופיל)
router.get('/', async (req, res) => {
    try {
        const stats = [
            { day: 'א', count: 4 },
            { day: 'ב', count: 7 },
            { day: 'ג', count: 2 },
            { day: 'ד', count: 9 },
            { day: 'ה', count: 5 },
            { day: 'ו', count: 8 },
            { day: 'ש', count: 3 }
        ];
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בטעינת נתונים' });
    }
});

module.exports = router;