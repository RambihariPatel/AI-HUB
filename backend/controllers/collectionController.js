import Collection from '../models/Collection.js';

// @desc    Get user's collections
// @route   GET /api/collections
// @access  Private
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id }).populate('tools');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Collection name is required' });
  }

  try {
    const existing = await Collection.findOne({ user: req.user._id, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A folder with this name already exists' });
    }

    const collection = new Collection({
      name: name.trim(),
      user: req.user._id,
      tools: [],
    });

    const created = await collection.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a tool to a collection
// @route   POST /api/collections/:id/tools
// @access  Private
export const addToolToCollection = async (req, res) => {
  const { toolId } = req.body;

  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.tools.some(id => id.toString() === toolId.toString())) {
      return res.status(400).json({ message: 'Tool already in this collection' });
    }

    collection.tools.push(toolId);
    await collection.save();

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a tool from a collection
// @route   DELETE /api/collections/:id/tools/:toolId
// @access  Private
export const removeToolFromCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.tools = collection.tools.filter(id => id.toString() !== req.params.toolId);
    await collection.save();

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.json({ message: 'Collection removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
