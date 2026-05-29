import User from '../models/User.js';
import Tool from '../models/Tool.js';

// @desc    Add tool to favorites
// @route   POST /api/users/favorites
export const addToFavorites = async (req, res) => {
  const { toolId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    const isAlreadyFavorited = user.favorites.some((id) => id?.toString() === toolId);

    if (isAlreadyFavorited) {
      // Remove from favorites if already exists
      user.favorites = user.favorites.filter((id) => id?.toString() !== toolId);
      await user.save();
      return res.json({ message: 'Removed from favorites', favorites: user.favorites });
    }

    user.favorites.push(toolId);
    await user.save();

    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    console.error("addToFavorites error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to history
// @route   POST /api/users/history
export const addToHistory = async (req, res) => {
  const { toolId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    // Remove if already in history to move to top
    user.history = user.history.filter((h) => h.tool.toString() !== toolId);

    user.history.unshift({ tool: toolId });

    // Keep only last 20 items
    if (user.history.length > 20) {
      user.history.pop();
    }

    await user.save();
    res.json({ message: 'Added to history' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's favorites
// @route   GET /api/users/favorites
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's history
// @route   GET /api/users/history
export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('history.tool');
    res.json(user.history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle alert subscription for a tool
// @route   POST /api/users/subscriptions
export const toggleSubscription = async (req, res) => {
  const { toolId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    // Initial empty array safeguard
    if (!user.alertSubscriptions) {
      user.alertSubscriptions = [];
    }

    const isSubscribed = user.alertSubscriptions.some((id) => id?.toString() === toolId.toString());

    if (isSubscribed) {
      user.alertSubscriptions = user.alertSubscriptions.filter((id) => id?.toString() !== toolId.toString());
      await user.save();
      return res.json({ message: 'Unsubscribed from alerts', alertSubscriptions: user.alertSubscriptions });
    }

    user.alertSubscriptions.push(toolId);
    await user.save();

    res.json({ message: 'Subscribed to alerts', alertSubscriptions: user.alertSubscriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's active tool alert subscriptions
// @route   GET /api/users/subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('alertSubscriptions');
    res.json(user.alertSubscriptions || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
