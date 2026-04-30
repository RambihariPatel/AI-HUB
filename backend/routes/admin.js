const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/admin/all-tools
// @desc    Get all tools for management
router.get('/all-tools', protect, admin, async (req, res) => {
    try {
        const tools = await Tool.find({}).populate('submittedBy', 'name email').sort({ createdAt: -1 });
        res.json(tools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/pending
// @desc    Get all pending tools
router.get('/pending', protect, admin, async (req, res) => {
    try {
        const tools = await Tool.find({ status: 'pending' }).populate('submittedBy', 'name email');
        res.json(tools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/approve/:id
// @desc    Approve a tool
router.put('/approve/:id', protect, admin, async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        if (!tool) return res.status(404).json({ message: 'Tool not found' });

        tool.status = 'approved';
        await tool.save();

        // Notify the submitter
        await Notification.create({
            user: tool.submittedBy,
            title: "Tool Approved! 🎉",
            message: `Your tool "${tool.name}" has been approved and is now live.`,
            type: "system",
            tool: tool._id
        });

        res.json({ message: 'Tool approved!', tool });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/admin/reject/:id
// @desc    Reject a tool
router.delete('/reject/:id', protect, admin, async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        if (!tool) return res.status(404).json({ message: 'Tool not found' });

        await tool.deleteOne();
        res.json({ message: 'Tool rejected and removed.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/admin/seed
// @desc    Seed sample tools (Admin only)
router.post('/seed', protect, admin, async (req, res) => {
    try {
        const sampleTools = [
            {
                name: "Gemini Pro",
                link: "https://deepmind.google/technologies/gemini/",
                category: "Coding",
                tagline: "Google's most capable AI model",
                descriptionShort: "A multimodal AI model capable of reasoning across text, images, and video.",
                descriptionLong: "Gemini is Google's most capable AI model, built from the ground up to be multimodal. It can understand, operate across and combine different types of information including text, images, video, and code.",
                pricing: "Freemium",
                status: "approved",
                rating: 4.8
            },
            {
                name: "ChatGPT",
                link: "https://chat.openai.com",
                category: "Writing",
                tagline: "Conversational AI by OpenAI",
                descriptionShort: "The world's most popular AI chatbot for text generation and assistance.",
                descriptionLong: "ChatGPT is a sibling model to InstructGPT, which is trained to follow an instruction in a prompt and provide a detailed response. It is a generative AI that allows users to have human-like conversations.",
                pricing: "Freemium",
                status: "approved",
                rating: 4.9
            },
            {
                name: "Midjourney",
                link: "https://www.midjourney.com",
                category: "Image",
                tagline: "Artistic AI image generation",
                descriptionShort: "Create stunning artistic images from simple text prompts via Discord.",
                descriptionLong: "Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species. It generates high-quality images from natural language descriptions.",
                pricing: "Paid",
                status: "approved",
                rating: 4.7
            },
            {
                name: "Claude 3",
                link: "https://claude.ai",
                category: "Writing",
                tagline: "Anthropic's most intelligent model",
                descriptionShort: "A highly capable AI model focused on safety and nuanced reasoning.",
                descriptionLong: "Claude is a next-generation AI assistant based on Anthropic’s research into training helpful, honest, and harmless AI systems. It is capable of a wide variety of tasks from sophisticated reasoning to creative writing.",
                pricing: "Freemium",
                status: "approved",
                rating: 4.8
            },
            {
                name: "Perplexity AI",
                link: "https://www.perplexity.ai",
                category: "Productivity",
                tagline: "AI-powered search engine",
                descriptionShort: "An AI search engine that provides direct answers with citations.",
                descriptionLong: "Perplexity AI is an AI-powered search engine and chatbot that uses natural language processing to provide real-time information and direct answers to user queries with source citations.",
                pricing: "Freemium",
                status: "approved",
                rating: 4.6
            },
            {
                name: "Canva AI",
                link: "https://www.canva.com",
                category: "Automation",
                tagline: "Magic design tools for everyone",
                descriptionShort: "AI-powered design tools to create presentations, social media, and more.",
                descriptionLong: "Canva’s Magic Studio brings together the best AI-powered tools to help you and your team create content faster than ever before. From Magic Media to Magic Edit, it transforms the design process.",
                pricing: "Freemium",
                status: "approved",
                rating: 4.5
            }
        ];

        // Optional: Clear existing tools to avoid duplicates during seeding
        await Tool.deleteMany({ status: 'approved' });

        await Tool.insertMany(sampleTools);
        res.json({ 
            message: `Database seeded successfully with ${sampleTools.length} tools!`,
            timestamp: new Date().toISOString(),
            version: "V2_SCHEMA_FIXED"
        });
    } catch (error) {
        console.error('Seed Error:', error);
        res.status(500).json({ message: error.message, details: error.errors });
    }
});

module.exports = router;
