const Post = require('../models/Post');
const Group = require('../models/Group');

exports.getPostStatsByMediaType = async (req, res) => {
    try {
        const stats = await Post.aggregate([
            {
                $project: {
                    mediaType: {
                        $cond: {
                            if: { $and: [{ $expr: { $gt: [{ $strLenCP: { $ifNull: ["$videoUrl", ""] } }, 0] } }] },
                            then: "video",
                            else: {
                                $cond: {
                                    if: { $and: [{ $expr: { $gt: [{ $strLenCP: { $ifNull: ["$imageUrl", ""] } }, 0] } }] },
                                    then: "image",
                                    else: "text"
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$mediaType",
                    totalPosts: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGroupMemberStats = async (req, res) => {
    try {
        const stats = await Group.aggregate([
            { $project: { name: 1, memberCount: { $size: "$members" } } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchPosts = async (req, res) => {
    try {
        const { text, mediaType, fromDate } = req.query;
        let queryFilter = {};
        if (text) queryFilter.content = { $regex: text, $options: 'i' };
        if (mediaType && mediaType !== 'none') queryFilter.mediaType = mediaType;
        if (fromDate) queryFilter.createdAt = { $gte: new Date(fromDate) };

        const results = await Post.find(queryFilter).populate('author', 'username');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בחיפוש הפוסטים' });
    }
};

exports.searchGroups = async (req, res) => {
    try {
        const { name, adminId, minMembers } = req.query;
        let queryFilter = {};
        if (name) queryFilter.name = { $regex: name, $options: 'i' };
        if (adminId) queryFilter.creatorId = adminId;
        if (minMembers) queryFilter[`members.${parseInt(minMembers) - 1}`] = { $exists: true };

        const groups = await Group.find(queryFilter);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בחיפוש הקבוצות' });
    }
};


exports.getStats = async (req, res) => {
    try {
        const userId = req.session && req.session.user ? req.session.user.id : null;
        
        const fullWeek = [
            { day: "'א", count: 0 },
            { day: "'ב", count: 0 },
            { day: "'ג", count: 0 },
            { day: "'ד", count: 0 },
            { day: "'ה", count: 0 },
            { day: "'ו", count: 0 },
            { day: "'ש", count: 0 }
        ];

        if (!userId) {
            return res.json(fullWeek);
        }

        const mongoose = require('mongoose');
        const stats = await Post.aggregate([
            { $match: { author: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    total: { $sum: 1 }
                }
            }
        ]);

        const daysMap = { 1: "'א", 2: "'ב", 3: "'ג", 4: "'ד", 5: "'ה", 6: "'ו", 7: "'ש" };

        stats.forEach(item => {
            const dayName = daysMap[item._id];
            const foundDay = fullWeek.find(d => d.day === dayName);
            if (foundDay) {
                foundDay.count = item.total;
            }
        });

        res.json(fullWeek);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};