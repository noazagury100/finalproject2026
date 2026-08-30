const Group = require('../models/Group');
const User = require('../models/User');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('admin', 'username').populate('members', 'username');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בשליפת הקבוצות' });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.session?.user?.id;

        let adminUser = userId ? await User.findById(userId) : await User.findOne();
        if (!adminUser) {
            return res.status(400).json({ error: 'חובה להיות מחובר כדי ליצור קבוצה' });
        }

        const newGroup = await Group.create({
            name,
            description: description || 'קבוצה ברשת',
            admin: adminUser._id,
            members: [adminUser._id]
        });

        const populatedGroup = await Group.findById(newGroup._id).populate('admin', 'username').populate('members', 'username');
        res.status(201).json(populatedGroup);
    } catch (error) {
        res.status(400).json({ error: 'שגיאה ביצירת הקבוצה או ששם הקבוצה כבר קיים' });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.session?.user?.id;

        let user = userId ? await User.findById(userId) : await User.findOne();
        if (!user) return res.status(401).json({ error: 'יש להתחבר כדי להצטרף' });

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'קבוצה לא נמצאה' });

        const isMember = group.members.some(m => m.toString() === user._id.toString());
        if (!isMember) {
            group.members.push(user._id);
            await group.save();
        }

        const updatedGroup = await Group.findById(groupId).populate('admin', 'username').populate('members', 'username');
        res.json(updatedGroup);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בהצטרפות לקבוצה' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        await Group.findByIdAndDelete(groupId);
        res.json({ message: 'הקבוצה נמחקה בהצלחה' });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה במחיקת הקבוצה' });
    }
};

exports.getGroupsLocations = async (req, res) => {
    try {
        const groups = await Group.find({}, 'name description lat lng members');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בטעינת מיקומי הקבוצות' });
    }
};