require('dotenv').config();
const mongoose = require('mongoose');
const Tool = require('./models/Tool');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Tool.countDocuments();
        console.log(`Total tools in DB: ${count}`);
        const categories = await Tool.distinct('category');
        console.log(`Categories found: ${categories.join(', ')}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
