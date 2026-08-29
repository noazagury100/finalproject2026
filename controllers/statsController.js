const Post = require('../models/Post');
const Group = require('../models/Group');

// --- 2 שאילתות GroupBy (Aggregation) ---

// 1. GroupBy: כמות פוסטים לפי סוג מדיה (text/image/video)
exports.getPostStatsByMediaType = async (req, res) => {
    try {
        const stats = await Post.aggregate([
            { $group: { _id: "$mediaType", totalPosts: { $sum: 1 } } },
            { $sort: { totalPosts: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GroupBy: כמות חברים בכל קבוצה
exports.getGroupMemberStats = async (req, res) => {
    try {
        const stats = await Group.aggregate([
            { $project: { name: 1, memberCount: { $size: "$members" } } },
            { $group: { _id: "$_id", groupName: { $first: "$name" }, totalMembers: { $first: "$memberCount" } } },
            { $sort: { totalMembers: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2 שאילתות חיפוש מורכבות ---

// 1. חיפוש פוסטים לפי: טקסט חופשי, סוג מדיה ותאריך התחלה
exports.searchPosts = async (req, res) => {
    try {
        const { text, mediaType, fromDate } = req.query;
        let queryFilter = {};

        if (text) {
            queryFilter.text = { $regex: text, $options: 'i' };
        }
        if (mediaType) {
            queryFilter.mediaType = mediaType;
        }
        if (fromDate) {
            queryFilter.createdAt = { $gte: new Date(fromDate) };
        }

        const results = await Post.find(queryFilter).populate('author', 'username');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בחיפוש הפוסטים' });
    }
};

// 2. חיפוש קבוצות לפי: שם קבוצה, מזהה מנהל וכמות חברים מינימלית
exports.searchGroups = async (req, res) => {
    try {
        const { name, adminId, minMembers } = req.query;
        let queryFilter = {};

        if (name) {
            queryFilter.name = { $regex: name, $options: 'i' };
        }
        if (adminId) {
            queryFilter.admin = adminId;
        }
        if (minMembers) {
            queryFilter[`members.${parseInt(minMembers) - 1}`] = { $exists: true };
        }

        const groups = await Group.find(queryFilter).populate('admin', 'username');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בחיפוש הקבוצות' });
    }
};

// --- שאילתות D3.js מותאמות לתצוגה הויזואלית ---

// 1. פוסטים לפי קטגוריות
exports.getPostsStats = async (req, res) => {
    try {
        const stats = await Post.aggregate([
            { $group: { _id: { $ifNull: ["$category", "כללי"] }, count: { $sum: 1 } } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. כמות חברים בקבוצה
exports.getGroupsStats = async (req, res) => {
    try {
        const stats = await Group.aggregate([
            { 
                $project: { 
                    name: 1, 
                    membersCount: { 
                        $cond: { 
                            if: { $isArray: "$members" }, 
                            then: { $size: "$members" }, 
                            else: 0 
                        } 
                    } 
                } 
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. סטטיסטיקה שבועית חינאמית מ-MongoDB עבור גרף ה-D3 בדף הפרופיל
exports.getStats = async (req, res) => {
    try {
        const stats = await Post.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    totalLikes: { $sum: "$likes" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const daysMap = { 1: "'א", 2: "'ב", 3: "'ג", 4: "'ד", 5: "'ה", 6: "'ו", 7: "'ש" };
        
        let formattedData = stats.map(item => ({
            day: daysMap[item._id] || "'א",
            likes: item.totalLikes || item.count || 0
        }));

        // גיבוי תצוגתי במידה והמסד עדיין ריק מפוסטים
        if (formattedData.length === 0) {
            formattedData = [
                { day: "'א", likes: 0 },
                { day: "'ב", likes: 0 },
                { day: "'ג", likes: 0 },
                { day: "'ד", likes: 0 },
                { day: "'ה", likes: 0 }
            ];
        }

        res.json(formattedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};