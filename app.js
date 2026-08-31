const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');

const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secretKeyInstagram123',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'feed.html'));
});

app.get('/explore', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'explore.html'));
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/groups', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'groups.html'));
});

app.get('/stats', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'stats.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/stats', statsRoutes);

app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});