const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { protect } = require('../middleware/auth');

// Get all collections
router.get('/', protect, async (req, res) => {
    try {
        const cols = await Collection.find({ user: req.user._id }).populate('tools');
        res.json(cols);
    } catch (err) {
        console.error('GET COLLECTIONS ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Create collection
router.post('/', protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        const exists = await Collection.findOne({ user: req.user._id, name });
        if (exists) return res.status(400).json({ message: 'Collection name already exists' });

        const col = new Collection({ user: req.user._id, name, description, tools: [] });
        await col.save();
        res.status(201).json(col);
    } catch (err) {
        console.error('CREATE COLLECTION ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Add tool to collection
router.post('/add-tool', protect, async (req, res) => {
    try {
        const { collectionId, toolId } = req.body;
        const col = await Collection.findOne({ _id: collectionId, user: req.user._id });
        if (!col) return res.status(404).json({ message: 'Collection not found' });

        const alreadyIn = col.tools.some(t => t.toString() === toolId.toString());
        if (!alreadyIn) {
            col.tools.push(toolId);
            await col.save();
        }
        
        const populatedCol = await Collection.findById(col._id).populate('tools');
        res.json({ message: 'Tool added', collection: populatedCol });
    } catch (err) {
        console.error('ADD TOOL ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Remove tool from collection
router.post('/remove-tool', protect, async (req, res) => {
    try {
        const { collectionId, toolId } = req.body;
        
        const col = await Collection.findOneAndUpdate(
            { _id: collectionId, user: req.user._id },
            { $pull: { tools: toolId } },
            { new: true }
        ).populate('tools');

        if (!col) return res.status(404).json({ message: 'Collection not found' });

        res.json({ message: 'Tool removed', collection: col });
    } catch (err) {
        console.error('REMOVE TOOL ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Delete collection
router.delete('/:id', protect, async (req, res) => {
    try {
        const col = await Collection.findOne({ _id: req.params.id, user: req.user._id });
        if (!col) return res.status(404).json({ message: 'Collection not found' });
        await col.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('DELETE COLLECTION ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
