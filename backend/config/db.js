const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        console.warn('Backend is running without a database connection. Real data APIs will fail.');
        // process.exit(1);
    }
};

module.exports = connectDB;
