
import mongoose from 'mongoose';
import User from './src/server/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nbnc')
    .then(async () => {
        console.log('MongoDB Connected');
        try {
            const users = await User.find({}, 'username email');
            console.log('--- Users in DB ---');
            if (users.length === 0) {
                console.log('No users found.');
            } else {
                users.forEach(u => console.log(`Username: ${u.username}, Email: ${u.email}`));
            }
            console.log('-------------------');
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.log('MongoDB Connection Error:', err));
