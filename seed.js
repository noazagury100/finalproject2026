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

        const user1 = await User.create({ username: 'noa_z', password: 'password123' });
        const user2 = await User.create({ username: 'dog_lover', password: 'password123' });

        await Post.create([
            {
                author: user1._id,
                text: 'גולדן רטריבר מתוק שפגשתי היום בגינה! 🐶',
                mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
                mediaType: 'image',
                likesCount: 5,
                comments: [{ username: 'dog_lover', text: 'איזה מתוק!' }]
            },
            {
                author: user2._id,
                text: 'חבר חדש ומקסים על ארבע! 🐶✨',
                mediaUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
                mediaType: 'image',
                likesCount: 12
            }
        ]);

        await Group.create([
            { name: 'אוהבי חיות', description: 'קבוצה לכל מי שאוהב חיות מחמד', admin: user1._id },
            { name: 'מפגשי גינה', description: 'מארגנים מפגשים בפארק', admin: user2._id }
        ]);

        console.log('✅ Seed Data Updated!');
        process.exit();
    } catch (err) {
        console.error('❌ Seed Error:', err);
        process.exit(1);
    }
};

seedData();