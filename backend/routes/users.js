const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/users/favourites
// @desc    Add or remove a tool from favourites
router.post('/favourites', protect, async (req, res) => {
    try {
        const { toolId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFavourite = user.favourites.includes(toolId);

        if (isFavourite) {
            // Remove from favourites
            user.favourites = user.favourites.filter(id => id.toString() !== toolId.toString());
        } else {
            // Add to favourites
            user.favourites.push(toolId);
        }

        await user.save();
        res.json({ favourites: user.favourites });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/users/history
// @desc    Add a tool to recently viewed history
router.post('/history', protect, async (req, res) => {
    try {
        const { toolId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove if already exists so it can be moved to front
        user.history = user.history.filter(id => id.toString() !== toolId.toString());
        
        // Add to front of array
        user.history.unshift(toolId);

        // Keep only last 20
        if (user.history.length > 20) {
            user.history.pop();
        }

        await user.save();
        res.json({ history: user.history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
