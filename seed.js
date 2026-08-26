const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');
const Group = require('./models/Group');

const seedData = async () => {
    try {
        await connectDB();

        await User.deleteMany({});
        await Post.deleteMany({});
        await Group.deleteMany({});

        // יצירת משתמשים עם השם avi_cohen
        const user1 = await User.create({ username: 'avi_cohen', password: 'password123' });
        const user2 = await User.create({ username: 'itay_dev', password: 'password123' });

        // יצירת קבוצות
        const group1 = await Group.create({ name: 'קבוצת תכנות', admin: user1._id });
        const group2 = await Group.create({ name: 'קבוצת מוזיקה', admin: user2._id });

        // יצירת פוסטים עם תמונות תקינות
        await Post.create([
            {
                author: user1._id,
                text: 'ברוכים הבאים לרשת החברתית החדשה שלנו! 🚀',
                mediaType: 'text'
            },
            {
                author: user1._id,
                text: 'משהו נחמד לראות בווידאו 🎥',
                mediaType: 'video',
                mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
            },
            {
                author: user2._id,
                text: 'תמונה ראשונה במערכת! 📸',
                mediaType: 'image',
                mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
            }
        ]);

        console.log('✅ Seed Data Inserted Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Error Seeding Data:', error);
        process.exit(1);
    }
};

seedData();