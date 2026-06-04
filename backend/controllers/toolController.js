import Tool from '../models/Tool.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Fetch all tools with filtering and search
// @route   GET /api/tools
export const getTools = async (req, res) => {
  const { category, pricing, search, rating, modelFilter } = req.query;

  let query = { isApproved: { $ne: false } };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (pricing && pricing !== 'All') {
    query.pricing = pricing;
  }

  // Filter: tools with a completely free model (freeAvailable: true)
  if (modelFilter === 'freeModel') {
    query['modelInfo.freeAvailable'] = true;
  }

  // Filter: tools that offer credits system
  if (modelFilter === 'credits') {
    query['modelInfo.credits'] = { $exists: true, $nin: [null, '', 'None', 'N/A'] };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } },
      { descriptionShort: { $regex: search, $options: 'i' } },
      { useCases: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  try {
    const tools = await Tool.find(query)
      .select('-descriptionLong -plans')
      .sort({ rating: -1 });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single tool
// @route   GET /api/tools/:id
export const getToolById = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (tool) {
      // Increment clicks
      tool.clicks += 1;
      await tool.save();
      res.json(tool);
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending tools
// @route   GET /api/tools/trending
export const getTrendingTools = async (req, res) => {
  try {
    let tools = await Tool.find({ isApproved: { $ne: false }, clicks: { $gt: 0 } })
      .sort({ clicks: -1 })
      .limit(10);

    if (tools.length < 10) {
      const existingIds = tools.map((t) => t._id);
      
      const generalCategories = [
        'Writing', 'Coding', 'Image', 'Video', 'Audio', 
        'Productivity', 'Education', 'Design'
      ];

      // Try to find general-use free/freemium tools first
      let fallbackTools = await Tool.find({
        isApproved: { $ne: false },
        _id: { $nin: existingIds },
        category: { $in: generalCategories },
        pricing: { $in: ['Free', 'Freemium'] }
      })
        .sort({ rating: -1 })
        .limit(10 - tools.length);

      // If still not enough, fallback to any tool sorted by rating
      if (tools.length + fallbackTools.length < 10) {
        const selectedIds = [...existingIds, ...fallbackTools.map(t => t._id)];
        const moreFallbacks = await Tool.find({
          isApproved: { $ne: false },
          _id: { $nin: selectedIds }
        })
          .sort({ rating: -1 })
          .limit(10 - (tools.length + fallbackTools.length));
        
        fallbackTools = [...fallbackTools, ...moreFallbacks];
      }

      tools = [...tools, ...fallbackTools];
    }
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get most favorited tools
// @route   GET /api/tools/favorites-trending
export const getMostFavoritedTools = async (req, res) => {
  try {
    const favoriteCounts = await User.aggregate([
      { $unwind: '$favorites' },
      { $group: { _id: '$favorites', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const toolIds = favoriteCounts.map(fc => fc._id);

    let tools = await Tool.find({ _id: { $in: toolIds }, isApproved: { $ne: false } });

    const toolsMap = tools.reduce((acc, t) => {
      acc[t._id.toString()] = t.toObject();
      return acc;
    }, {});

    const sortedTools = favoriteCounts
      .map(fc => {
        const tool = toolsMap[fc._id.toString()];
        if (tool) {
          return { ...tool, favoriteCount: fc.count };
        }
        return null;
      })
      .filter(Boolean);

    if (sortedTools.length < 5) {
      const existingIds = sortedTools.map(t => t._id.toString());
      const fallbackTools = await Tool.find({
        isApproved: { $ne: false },
        _id: { $nin: existingIds }
      })
        .sort({ rating: -1 })
        .limit(5 - sortedTools.length);

      const fallbackMapped = fallbackTools.map(t => ({
        ...t.toObject(),
        favoriteCount: 0
      }));

      res.json([...sortedTools, ...fallbackMapped]);
    } else {
      res.json(sortedTools);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tools by IDs (for comparison)
// @route   GET /api/tools/compare?ids=id1,id2
export const compareTools = async (req, res) => {
  const { ids } = req.query;
  const idArray = ids.split(',');

  try {
    const tools = await Tool.find({ _id: { $in: idArray }, isApproved: { $ne: false } });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a tool (Admin)
// @route   POST /api/tools
export const createTool = async (req, res) => {
  try {
    const tool = new Tool(req.body);
    const createdTool = await tool.save();
    res.status(201).json(createdTool);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a tool (Admin)
// @route   PUT /api/tools/:id
export const updateTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (tool) {
      Object.assign(tool, req.body);
      const updatedTool = await tool.save();
      res.json(updatedTool);
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a tool (Admin)
// @route   DELETE /api/tools/:id
export const deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (tool) {
      await tool.deleteOne();
      res.json({ message: 'Tool removed' });
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a tool (Public/Pending)
// @route   POST /api/tools/submit
export const submitTool = async (req, res) => {
  try {
    const tool = new Tool({
      ...req.body,
      isApproved: false,
      submittedBy: req.user._id,
    });
    const createdTool = await tool.save();
    res.status(201).json({ message: 'Tool submitted successfully and is pending approval.', tool: createdTool });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all pending tools (Admin)
// @route   GET /api/tools/pending
export const getPendingTools = async (req, res) => {
  try {
    const tools = await Tool.find({ isApproved: false }).populate('submittedBy', 'name email');
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a submitted tool (Admin)
// @route   PUT /api/tools/:id/approve
export const approveTool = async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (tool) {
      tool.isApproved = true;
      const updatedTool = await tool.save();
      res.json({ message: 'Tool approved successfully', tool: updatedTool });
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's submitted tools
// @route   GET /api/tools/my-submissions
export const getMySubmissions = async (req, res) => {
  try {
    const tools = await Tool.find({ submittedBy: req.user._id });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trigger an alert for a tool (Price Drop or Major Feature Update)
// @route   POST /api/tools/:id/alerts
export const createToolAlert = async (req, res) => {
  const { type, title, message, oldPrice, newPrice } = req.body;
  const toolId = req.params.id;

  try {
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    // Check authorization: must be admin OR the developer who submitted the tool
    const isDeveloper = tool.submittedBy && tool.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isDeveloper && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to dispatch alerts for this tool' });
    }

    // Find all users who are subscribed to alerts for this tool
    const subscribedUsers = await User.find({ alertSubscriptions: toolId });

    // Create a notification for each subscribed user
    const notifications = subscribedUsers.map(u => ({
      user: u._id,
      tool: toolId,
      type,
      title,
      message,
      oldPrice: oldPrice || '',
      newPrice: newPrice || '',
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // If type is price drop and newPrice matches one of the enums, update it
    if (type === 'price_drop' && newPrice && ['Free', 'Paid', 'Freemium'].includes(newPrice)) {
      tool.pricing = newPrice;
      await tool.save();
    }

    res.status(201).json({ 
      message: `Alert dispatched successfully to ${subscribedUsers.length} subscribers!`, 
      subscriberCount: subscribedUsers.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
