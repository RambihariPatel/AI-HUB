import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tool from '../models/Tool.js';

dotenv.config();

const updateTrending = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-tools-hub';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Rename 'Gemini Data' to 'Gemini' and update clicks
    const gemini = await Tool.findOneAndUpdate(
      { name: 'Gemini Data' },
      { name: 'Gemini', clicks: 11000 },
      { new: true }
    );
    if (gemini) {
      console.log('Updated Gemini:', gemini.name, 'clicks:', gemini.clicks);
    } else {
      // Maybe it is already named Gemini
      const geminiDirect = await Tool.findOneAndUpdate(
        { name: 'Gemini' },
        { clicks: 11000 },
        { new: true }
      );
      console.log('Updated Gemini (direct):', geminiDirect?.name, 'clicks:', geminiDirect?.clicks);
    }

    // 2. Update ChatGPT clicks
    const chatgpt = await Tool.findOneAndUpdate(
      { name: 'ChatGPT' },
      { clicks: 12000 },
      { new: true }
    );
    console.log('Updated ChatGPT clicks:', chatgpt?.name, 'clicks:', chatgpt?.clicks);

    // 3. Update Perplexity clicks
    const perplexity = await Tool.findOneAndUpdate(
      { name: 'Perplexity' },
      { clicks: 10000 },
      { new: true }
    );
    console.log('Updated Perplexity clicks:', perplexity?.name, 'clicks:', perplexity?.clicks);

    console.log('Successfully updated trending tools in database!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating tools:', error);
    process.exit(1);
  }
};

updateTrending();
