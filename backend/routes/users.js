const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Toggle Favourite
router.post('/favourites', protect, async (req, res) => {
    try {
        const { toolId } = req.body;

        if (!toolId) {
            return res.status(400).json({ message: 'toolId is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const idx = user.favourites.findIndex(id => id && id.toString() === toolId.toString());
        if (idx > -1) {
            user.favourites.splice(idx, 1);
        } else {
            user.favourites.push(toolId);
        }
        
        // Use findByIdAndUpdate to avoid version conflicts
        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { favourites: user.favourites },
            { new: true }
        );
        
        res.json({ favourites: updated.favourites });
    } catch (err) {
        console.error('FAV ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Add to History
router.post('/history', protect, async (req, res) => {
    try {
        const { toolId } = req.body;

        if (!toolId) {
            return res.status(400).json({ message: 'toolId is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const filtered = user.history.filter(id => id && id.toString() !== toolId.toString());
        filtered.unshift(toolId);
        if (filtered.length > 20) filtered.pop();

        await User.findByIdAndUpdate(
            req.user._id,
            { history: filtered },
            { new: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('HISTORY ADD ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Clear All History
router.delete('/history/all', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { history: [] });
        res.json({ message: 'History cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove one history item
router.delete('/history/item/:toolId', protect, async (req, res) => {
    try {
        const { toolId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const filtered = user.history.filter(id => id && id.toString() !== toolId.toString());
        await User.findByIdAndUpdate(req.user._id, { history: filtered }, { new: true });

        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error('HISTORY REMOVE ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
