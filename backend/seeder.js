const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tool = require('./models/Tool');
const User = require('./models/User');
const Review = require('./models/Review');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const categories = ['Writing', 'Coding', 'Image', 'Video', 'Audio', 'Data', 'Productivity', 'Marketing', 'Education', 'Automation'];

const generateTools = () => {
    const tools = [];
    let idCounter = 1;

    categories.forEach(category => {
        for (let i = 1; i <= 10; i++) {
            tools.push({
                name: `${category}Gen Pro ${i}`,
                tagline: `The ultimate ${category.toLowerCase()} tool for modern workflows.`,
                category: category,
                descriptionShort: `A powerful AI-driven platform for ${category.toLowerCase()} tasks, designed to save you time.`,
                descriptionLong: `Experience the next generation of AI with ${category}Gen Pro ${i}. This advanced tool utilizes state-of-the-art machine learning models to streamline your ${category.toLowerCase()} workflow. Whether you're a beginner or a professional, our intuitive interface and robust features empower you to achieve more in less time. Join thousands of satisfied users and revolutionize your productivity today.`,
                features: ['AI-powered generation', 'Cloud sync', 'Team collaboration', 'Custom templates'],
                pricing: i % 3 === 0 ? 'Free' : (i % 2 === 0 ? 'Freemium' : 'Paid'),
                plans: {
                    free: i % 3 === 0 || i % 2 === 0 ? 'Basic access with limited credits' : null,
                    pro: i % 3 !== 0 ? '$19.99/month for unlimited access' : null,
                    enterprise: '$99/month for teams'
                },
                rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Random rating between 3.5 and 5.0
                numReviews: Math.floor(Math.random() * 500),
                monthlyUsers: Math.floor(Math.random() * 100000) + 1000,
                modelInfo: {
                    modelName: i % 2 === 0 ? 'GPT-4' : 'Claude 3',
                    modelType: category === 'Image' ? 'Image Model' : 'LLM',
                    freeAvailable: i % 2 !== 0,
                    paidAvailable: true,
                    credits: '100 credits/month free',
                    apiAccess: i % 3 === 0
                },
                useCases: [`${category} Creation`, 'Professional Workflow', 'Automation'],
                pros: ['Fast processing', 'High quality output', 'Easy to use'],
                cons: ['Requires internet', 'Can be expensive for heavy users'],
                link: `https://example.com/tool${idCounter}`,
                logoUrl: `https://picsum.photos/seed/${idCounter}/200/200`,
                popularityLevel: i <= 3 ? 'High' : (i <= 7 ? 'Medium' : 'Low')
            });
            idCounter++;
        }
    });

    return tools;
};

const importData = async () => {
    try {
        await Tool.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        const createdUsers = await User.insertMany([
            { name: 'Admin User', email: 'admin@example.com', password: 'password123' } // plain text just for seed, wait we need to hash it? Admin route not needed for login right now, just for mock.
        ]);

        const adminUser = createdUsers[0]._id;
        const toolsData = generateTools();

        await Tool.insertMany(toolsData);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Tool.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
