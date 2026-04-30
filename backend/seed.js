require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Tool = require('./models/Tool');

const tools = [
  {
    name: "Gemini Pro",
    link: "https://deepmind.google/technologies/gemini/",
    category: "LLM",
    tagline: "Google's most capable AI model",
    descriptionShort: "A multimodal AI model capable of reasoning across text, images, and video.",
    pricing: "Freemium",
    status: "approved",
    rating: 4.8
  },
  {
    name: "ChatGPT",
    link: "https://chat.openai.com",
    category: "LLM",
    tagline: "Conversational AI by OpenAI",
    descriptionShort: "The world's most popular AI chatbot for text generation and assistance.",
    pricing: "Freemium",
    status: "approved",
    rating: 4.9
  },
  {
    name: "Midjourney",
    link: "https://www.midjourney.com",
    category: "Image Generation",
    tagline: "Artistic AI image generation",
    descriptionShort: "Create stunning artistic images from simple text prompts via Discord.",
    pricing: "Paid",
    status: "approved",
    rating: 4.7
  },
  {
    name: "Claude 3",
    link: "https://claude.ai",
    category: "LLM",
    tagline: "Anthropic's most intelligent model",
    descriptionShort: "A highly capable AI model focused on safety and nuanced reasoning.",
    pricing: "Freemium",
    status: "approved",
    rating: 4.8
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    // Clear existing tools if needed (optional)
    // await Tool.deleteMany({}); 

    await Tool.insertMany(tools);
    console.log("Database Seeded with sample tools! 🚀");
    
    process.exit();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
