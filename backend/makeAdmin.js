const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { role: 'admin' },
            { new: true }
        );
        if (user) {
            console.log(`Success! ${email} is now an ADMIN.`);
        } else {
            console.log(`User with email ${email} not found.`);
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Please provide an email: node makeAdmin.js your@email.com');
} else {
    makeAdmin(email);
}
