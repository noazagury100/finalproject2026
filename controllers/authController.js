const User = require('../models/User');

// הרשמת משתמש חדש (Register)
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'חובה להזין שם משתמש וסיסמה' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'שם המשתמש כבר קיים במערכת' });
        }

        const newUser = await User.create({ username, password });
        res.status(201).json({ message: 'ההרשמה בוצעה בהצלחה', user: { id: newUser._id, username: newUser.username } });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בהרשמת המשתמש' });
    }
};

// התחברות משתמש (Login)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
        }

        res.json({ message: 'התחברות בוצעה בהצלחה', user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: 'שגיאה בהתחברות' });
    }
};