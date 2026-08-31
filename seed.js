const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const Group = require('./models/Group');
const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        await User.deleteMany({});
        await Post.deleteMany({});
        await Group.deleteMany({});

        const user1 = await User.create({ username: 'omer_levi', password: '123' });
        const user2 = await User.create({ username: 'almog_k', password: '123' });

        await Post.create([
            { 
                content: 'לילה טוב לכולם! 🌙', 
                author: user1._id,
                mediaType: 'text'
            },
            { 
                content: ':)', 
                author: user1._id, 
                imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
                mediaType: 'image'
            },
            { 
                content: 'טיול של אחה"צ עם הכלב בים 🌊🐕', 
                author: user2._id, 
                imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
                mediaType: 'image'
            },
            { 
                content: 'סרטון קצר לצפייה ', 
                author: user2._id, 
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                mediaType: 'video'
            }
        ]);

        await Group.create([
            { 
                name: 'חובבי כלבים 🐶', 
                description: 'קבוצה לכל מי שאוהב כלבים, שיתוף טיפים ותמונות!', 
                address: 'תל אביב',
                creator: 'omer_levi', 
                creatorId: user1._id,
                members: [user1._id, user2._id] 
            },
            { 
                name: 'אילוף וטיפול בכלבים ', 
                description: 'שאלות ותשובות בנושאי אילוף כלבים וגידול נכון', 
                address: 'ירושלים',
                creator: 'almog_k', 
                creatorId: user2._id,
                members: [user2._id] 
            }
        ]);

        console.log('✅ נתוני Seed מעודכנים הוזנו בהצלחה!');
        process.exit();
    } catch (err) {
        console.error('שגיאה ב-Seed:', err);
        process.exit(1);
    }
};

seedData();