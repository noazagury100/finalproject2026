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
                mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Golden_Retriever_2000.jpg/800px-Golden_Retriever_2000.jpg',
                mediaType: 'image',
                likesCount: 5,
                comments: [{ username: 'dog_lover', text: 'איזה מתוק!' }]
            },
            {
                author: user2._id,
                text: 'האסקי סיבירי נהנה בשלג ❄️',
                mediaUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Siberian-husky.jpg/800px-Siberian-husky.jpg',
                mediaType: 'image',
                likesCount: 12
            }
        ]);

        await Group.create([
            { name: 'אוהבי כלבים', description: 'קבוצה לכל מי שאוהב כלבים וחיות מחמד', admin: user1._id },
            { name: 'טיולי כלבים', description: 'מארגנים מפגשים בגינות כלבים', admin: user2._id }
        ]);

        console.log('✅ Seed Data Inserted Successfully with Wikipedia Dogs!');
        process.exit();
    } catch (err) {
        console.error('❌ Seed Error:', err);
        process.exit(1);
    }
};

seedData();