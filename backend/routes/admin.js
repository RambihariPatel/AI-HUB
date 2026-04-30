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
            }
        ];

        await Tool.insertMany(sampleTools);
        res.json({ message: 'Database seeded successfully with 3 tools!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
