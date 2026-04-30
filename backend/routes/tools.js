const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const { protect } = require('../middleware/auth');

// @route   GET /api/tools
// @desc    Get all approved tools with pagination, search, and filtering
router.get('/', async (req, res) => {
    try {
        const pageSize = Number(req.query.pageSize) || 12;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { descriptionShort: { $regex: req.query.keyword, $options: 'i' } },
                { useCases: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};

        const categoryFilter = req.query.category ? { category: req.query.category } : {};
        const pricingFilter = req.query.pricing ? { pricing: req.query.pricing } : {};
        const useCaseFilter = req.query.useCase ? { useCases: req.query.useCase } : {};

        // ONLY show approved tools in the main list
        const filter = { ...keyword, ...categoryFilter, ...pricingFilter, ...useCaseFilter, status: 'approved' };

        const count = await Tool.countDocuments(filter);
        const tools = await Tool.find(filter)
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ tools, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/tools/submit
// @desc    Submit a new tool for approval
router.post('/submit', protect, async (req, res) => {
    try {
        const { name, link, category, tagline, descriptionShort, descriptionLong, pricing, features, pros, cons } = req.body;

        // CHECK FOR DUPLICATES (Name or Link)
        const existingTool = await Tool.findOne({ 
            $or: [
                { name: { $regex: new RegExp(`^${name}$`, 'i') } },
                { link: link.toLowerCase().trim() }
            ]
        });

        if (existingTool) {
            return res.status(400).json({ 
                message: 'This tool or URL is already in our directory!' 
            });
        }

        const tool = await Tool.create({
            name,
            link: link.toLowerCase().trim(),
            category,
            tagline,
            descriptionShort,
            descriptionLong,
            pricing,
            features,
            pros,
            cons,
            status: 'pending',
            submittedBy: req.user._id,
            rating: 0,
            numReviews: 0
        });

        res.status(201).json({ message: 'Tool submitted with full details!', tool });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tools/trending
// @desc    Get top trending tools (approved only)
router.get('/trending', async (req, res) => {
    try {
        const tools = await Tool.find({ status: 'approved' }).sort({ rating: -1 }).limit(10);
        res.json(tools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tools/categories
// @desc    Get all unique tool categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Tool.distinct('category', { status: 'approved' });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tools/:id
// @desc    Get single tool by ID
router.get('/:id', async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        if (tool) {
            res.json(tool);
        } else {
            res.status(404).json({ message: 'Tool not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
