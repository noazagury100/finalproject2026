const express = require('express');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');

const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groups');

const app = express();

// התחברות ל-MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Basic Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'feed.html'));
});

// נתיבי API
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);

// נתיב לבדיקה
app.get('/init-db', async (req, res) => {
    try {
        const testUser = await User.create({
            username: 'noa_test',
            password: '123456password'
        });
        res.json({ message: 'DB and User Created Successfully!', user: testUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});