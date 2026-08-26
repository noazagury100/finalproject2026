const express = require('express');
const path = require('path');
require('dotenv').config();

// ייבוא החיבור ל-DB והמודל
const connectDB = require('./config/db');
const User = require('./models/User');

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
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// נתיב לבדיקת יצירת ה-DB והכנסת משתמש ראשון
app.get('/init-db', async (req, res) => {
    try {
        const testUser = await User.create({
            username: 'noa_test',
            email: 'noa@example.com',
            password: '123456password',
            city: 'Rishon LeZion'
        });
        res.json({ message: 'DB and User Created Successfully!', user: testUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});