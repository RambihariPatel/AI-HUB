const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/auth/me
// @desc    Get user profile (Syncs with Clerk session)
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is populated by the 'protect' middleware after Clerk verification
        const user = await User.findById(req.user._id).populate('favourites').populate('history');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
