const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.get('/', async (req, res) => {
    try {
        const groups = await Group.find().populate('members', 'username');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בטעינת הקבוצות' });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'יש להתחבר למערכת' });
        }
        const { name, description, address } = req.body;
        const newGroup = await Group.create({
            name,
            description,
            address: address || 'תל אביב',
            creator: req.session.user.username,
            creatorId: req.session.user.id,
            members: [req.session.user.id]
        });
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה ביצירת הקבוצה' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'קבוצה לא נמצאה' });

        if (!req.session.user || (group.creatorId && group.creatorId.toString() !== req.session.user.id && group.creator !== req.session.user.username)) {
            return res.status(403).json({ error: 'אין לך הרשאת מנהל לערוך קבוצה זו' });
        }

        group.name = req.body.name || group.name;
        group.description = req.body.description || group.description;
        group.address = req.body.address || group.address;
        await group.save();
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בעדכון הקבוצה' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'קבוצה לא נמצאה' });

        if (!req.session.user || (group.creatorId && group.creatorId.toString() !== req.session.user.id && group.creator !== req.session.user.username)) {
            return res.status(403).json({ error: 'אין לך הרשאת מנהל למחוק קבוצה זו' });
        }

        await Group.findByIdAndDelete(req.params.id);
        res.json({ message: 'הקבוצה נמחקה בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: 'שגיאה במחיקת הקבוצה' });
    }
});

router.post('/:id/toggle-join', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'יש להתחבר למערכת' });
        }
        const group = await Group.findById(req.params.id);
        const userId = req.session.user.id;

        const memberIndex = group.members.findIndex(m => m.toString() === userId);
        if (memberIndex > -1) {
            group.members.splice(memberIndex, 1);
        } else {
            group.members.push(userId);
        }

        await group.save();
        const updatedGroup = await Group.findById(group._id).populate('members', 'username');
        res.json(updatedGroup);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בשינוי חברות בקבוצה' });
    }
});

router.post('/:id/remove-member', async (req, res) => {
    try {
        const { memberId } = req.body;
        const group = await Group.findById(req.params.id);

        if (!req.session.user || (group.creatorId && group.creatorId.toString() !== req.session.user.id && group.creator !== req.session.user.username)) {
            return res.status(403).json({ error: 'רק מנהל הקבוצה רשאי להסיר חברים' });
        }

        group.members = group.members.filter(m => m.toString() !== memberId);
        await group.save();
        res.json({ message: 'החבר הוסר בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בהסרת החבר' });
    }
});

module.exports = router;