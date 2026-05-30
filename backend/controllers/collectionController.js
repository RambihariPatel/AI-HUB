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

// @desc    Toggle public visibility of a collection
// @route   PUT /api/collections/:id/toggle-public
// @access  Private
export const toggleCollectionPublic = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.isPublic = !collection.isPublic;
    await collection.save();

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a shared collection by ID
// @route   GET /api/collections/shared/:id
// @access  Public (Optional auth)
export const getSharedCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate({
        path: 'tools',
        match: { isApproved: true }
      })
      .populate('user', 'name');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // If it's private, check if the requester is the owner
    if (!collection.isPublic) {
      return res.status(403).json({ message: 'This collection is private.' });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
