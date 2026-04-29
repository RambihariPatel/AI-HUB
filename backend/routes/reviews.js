const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Tool = require('../models/Tool');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create new review
router.post('/', protect, async (req, res) => {
    const { rating, comment, toolId } = req.body;

    try {
        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            tool: toolId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Tool already reviewed' });
        }

        const review = await Review.create({
            user: req.user._id,
            userName: req.user.name,
            userImage: req.user.imageUrl || '',
            tool: toolId,
            rating: Number(rating),
            comment
        });

        // Update tool's overall rating
        const reviews = await Review.find({ tool: toolId });
        tool.numReviews = reviews.length;
        tool.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await tool.save();

        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/reviews/:toolId
// @desc    Get reviews for a tool
router.get('/:toolId', async (req, res) => {
    try {
        const reviews = await Review.find({ tool: req.params.toolId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is the owner
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        const toolId = review.tool;
        await review.deleteOne();

        // Recalculate rating
        const Tool = require('../models/Tool');
        const tool = await Tool.findById(toolId);
        const allReviews = await Review.find({ tool: toolId });
        
        tool.numReviews = allReviews.length;
        tool.rating = allReviews.length > 0 
            ? allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length 
            : 0;

        await tool.save();

        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
