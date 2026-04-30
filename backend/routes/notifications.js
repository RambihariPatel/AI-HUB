const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/notifications/seed-test
// @desc    Seed dummy notifications for current user (Testing only)
router.get('/seed-test', protect, async (req, res) => {
    try {
        const testData = [
            {
                user: req.user._id,
                title: "50% Discount on Claude Pro!",
                message: "Limited time offer: Get Claude Pro at half price this weekend.",
                type: "price_drop"
            },
            {
                user: req.user._id,
                title: "Midjourney v7 Released",
                message: "Experience the next level of AI art with the newly launched Midjourney v7.",
                type: "feature_update"
            },
            {
                user: req.user._id,
                title: "Welcome to AI HUB!",
                message: "Thanks for joining. Start exploring the best AI tools now.",
                type: "system"
            }
        ];

        const created = await Notification.insertMany(testData);
        res.json({ message: "Test notifications created!", count: created.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
