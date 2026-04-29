const mongoose = require('mongoose');
const Tool = require('../backend/models/Tool');
const dotenv = require('dotenv');
dotenv.config({ path: '../backend/.env' });

async function testSubmission() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-tools-hub');
        console.log('Connected to DB');

        const testTool = {
            name: 'Test AI Tool ' + Date.now(),
            link: 'https://test-ai.com',
            category: 'Text',
            tagline: 'A perfect tool for testing',
            descriptionShort: 'Short description for testing',
            descriptionLong: 'This is a long detailed description for testing the submission flow.',
            pricing: 'Free',
            features: ['Feature 1', 'Feature 2'],
            pros: ['Pro 1', 'Pro 2'],
            cons: ['Con 1', 'Con 2'],
            status: 'pending'
        };

        const created = await Tool.create(testTool);
        console.log('✅ Tool Created Successfully with Full Detailing!');
        console.log('ID:', created._id);
        console.log('Status:', created.status);
        console.log('Features Count:', created.features.length);
        console.log('Pros Count:', created.pros.length);

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
