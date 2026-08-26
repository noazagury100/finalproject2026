const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// שליפת כל הקבוצות
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// יצירת קבוצה חדשה
router.post('/', async (req, res) => {
    try {
        const { name, description, admin } = req.body;
        const newGroup = await Group.create({ name, description, admin });
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;