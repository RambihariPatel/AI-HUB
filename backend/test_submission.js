const mongoose = require('mongoose');
const Tool = require('./models/Tool');
const dotenv = require('dotenv');
dotenv.config();

async function testSubmission() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-tools-hub');
        console.log('Connected to DB');

        const testTool = {
            name: 'Test AI Tool ' + Date.now(),
            link: 'https://test-ai.com',
            category: 'Writing', // Valid Enum
            tagline: 'A perfect tool for testing',
            descriptionShort: 'Short description for testing',
            descriptionLong: 'This is a long detailed description for testing the submission flow.',
            pricing: 'Free', // Valid Enum
            features: ['Feature 1', 'Feature 2'],
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1', 'Con 2'],
            status: 'pending'
        };

        const created = await Tool.create(testTool);
        console.log('✅ Tool Created Successfully with Full Detailing!');
        console.log('--- DATA SAVED ---');
        console.log('Name:', created.name);
        console.log('Status:', created.status);
        console.log('Features:', created.features);
        console.log('Pros:', created.pros);
        console.log('Cons:', created.cons);
        console.log('------------------');

        // Delete test tool
        await Tool.findByIdAndDelete(created._id);
        console.log('Test Tool Cleaned up.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Test Failed:', err);
        process.exit(1);
    }
}

testSubmission();
