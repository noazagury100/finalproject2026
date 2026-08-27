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


// --- 2 שאילתות חיפוש מורכבות (מבלבלות 3 פרמטרים מהמשתמש) ---

// 1. חיפוש פוסטים לפי: טקסט חופשי (text), סוג מדיה (mediaType), ותאריך התחלה (fromDate)
exports.searchPosts = async (req, res) => {
    try {
        const { text, mediaType, fromDate } = req.query;
        let queryFilter = {};

        if (text) {
            queryFilter.text = { $regex: text, $options: 'i' }; // חיפוש לא רגיש לאותיות
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

// 2. חיפוש קבוצות לפי: שם קבוצה (name), מזהה מנהל (adminId), וכמות חברים מינימלית (minMembers)
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