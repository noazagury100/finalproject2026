const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instagram_db');
        
        // ניקוי נתונים קודמים
        await User.deleteMany({});
        await Post.deleteMany({});

        // יצירת משתמשים לדוגמה
        const user1 = await User.create({ username: 'noa_style', password: '123' });
        const user2 = await User.create({ username: 'itay_dev', password: '123' });

        // יצירת פוסטים מסוגים שונים (טקסט, תמונה, וידאו)
        await Post.create([
            {
                author: user1._id,
                text: 'ברוכים הבאים לרשת החברתית החדשה שלנו! 🚀',
                mediaType: 'text'
            },
            {
                author: user1._id,
                text: 'משהו נחמד לראות בוידאו 🎥',
                mediaType: 'video',
                mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
            },
            {
                author: user2._id,
                text: 'תמונה ראשונה במערכת!',
                mediaType: 'image',
                mediaUrl: 'https://via.placeholder.com/600x400'
            }
        ]);

        console.log('✅ Seed Data Inserted Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seed Error:', error);
        process.exit(1);
    }
};

seedDB();