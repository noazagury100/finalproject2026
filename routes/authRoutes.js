const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);


router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            return res.redirect('/login');
        });
    } else {
        return res.redirect('/login');
    }
});

router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json(req.session.user);
    }
    return res.status(401).json({ error: 'לא מחובר' });
});

module.exports = router;