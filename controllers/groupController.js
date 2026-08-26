const Group = require('../models/Group');
const User = require('../models/User');

// שליפת כל הקבוצות (List)
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('admin', 'username').populate('members', 'username');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בשליפת הקבוצות' });
    }
};

// יצירת קבוצה חדשה (Create) - סעיף 26
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        
        // מציאת משתמש קיים כ-admin
        let adminUser = await User.findOne();
        if (!adminUser) {
            return res.status(400).json({ error: 'חובה ליצור משתמש תחילה' });
        }

        const newGroup = await Group.create({
            name,
            admin: adminUser._id,
            members: [adminUser._id]
        });

        res.status(201).json(newGroup);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה ביצירת הקבוצה' });
    }
};

// הצטרפות לקבוצה (Update)
exports.joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const user = await User.findOne();

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'קבוצה לא נמצאה' });

        if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await group.save();
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בהצטרפות לקבוצה' });
    }
};