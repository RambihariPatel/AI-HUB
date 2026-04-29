const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// @route   GET /api/tools
// @desc    Get all tools with pagination, search, and filtering
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

        const filter = { ...keyword, ...categoryFilter, ...pricingFilter, ...useCaseFilter };

        const count = await Tool.countDocuments(filter);
        const tools = await Tool.find(filter)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ tools, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tools/trending
// @desc    Get top trending tools (by popularity or rating)
router.get('/trending', async (req, res) => {
    try {
        const tools = await Tool.find({}).sort({ rating: -1, monthlyUsers: -1 }).limit(10);
        res.json(tools);
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

// @route   POST /api/tools/:id/reviews
// @desc    Create new review
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const tool = await Tool.findById(req.params.id);

        if (tool) {
            const alreadyReviewed = await Review.findOne({ tool: tool._id, user: req.user._id });

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = await Review.create({
                rating: Number(rating),
                comment,
                user: req.user._id,
                tool: tool._id
            });

            const allReviews = await Review.find({ tool: tool._id });
            
            tool.numReviews = allReviews.length;
            tool.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

            await tool.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Tool not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/tools/:id/reviews
// @desc    Get reviews for a tool
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ tool: req.params.id }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
