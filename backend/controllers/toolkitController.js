import Toolkit from '../models/Toolkit.js';
import Tool from '../models/Tool.js';

// @desc    Get all official toolkits (public)
// @route   GET /api/toolkits
export const getToolkits = async (req, res) => {
  try {
    const toolkits = await Toolkit.find({ isOfficial: true })
      .populate('tools')
      .sort({ createdAt: -1 });
    res.json(toolkits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single toolkit by id
// @route   GET /api/toolkits/:id
export const getToolkitById = async (req, res) => {
  try {
    const toolkit = await Toolkit.findById(req.params.id).populate('tools');
    if (!toolkit) return res.status(404).json({ message: 'Toolkit not found' });
    res.json(toolkit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a toolkit (Admin only)
// @route   POST /api/toolkits
export const createToolkit = async (req, res) => {
  try {
    const { name, description, emoji, color, toolIds, tags } = req.body;

    // Validate that tools exist
    const tools = await Tool.find({ _id: { $in: toolIds || [] }, isApproved: { $ne: false } });

    const toolkit = new Toolkit({
      name,
      description,
      emoji: emoji || '🧰',
      color: color || 'indigo',
      tools: tools.map(t => t._id),
      curatedBy: req.user._id,
      isOfficial: true,
      tags: tags || [],
    });

    const created = await toolkit.save();
    const populated = await Toolkit.findById(created._id).populate('tools');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a toolkit (Admin only)
// @route   PUT /api/toolkits/:id
export const updateToolkit = async (req, res) => {
  try {
    const toolkit = await Toolkit.findById(req.params.id);
    if (!toolkit) return res.status(404).json({ message: 'Toolkit not found' });

    const { name, description, emoji, color, toolIds, tags } = req.body;
    if (name) toolkit.name = name;
    if (description) toolkit.description = description;
    if (emoji) toolkit.emoji = emoji;
    if (color) toolkit.color = color;
    if (tags) toolkit.tags = tags;
    if (toolIds) {
      const tools = await Tool.find({ _id: { $in: toolIds }, isApproved: { $ne: false } });
      toolkit.tools = tools.map(t => t._id);
    }

    await toolkit.save();
    const populated = await Toolkit.findById(toolkit._id).populate('tools');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a toolkit (Admin only)
// @route   DELETE /api/toolkits/:id
export const deleteToolkit = async (req, res) => {
  try {
    const toolkit = await Toolkit.findByIdAndDelete(req.params.id);
    if (!toolkit) return res.status(404).json({ message: 'Toolkit not found' });
    res.json({ message: 'Toolkit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default official toolkits from existing DB tools
// @route   POST /api/toolkits/seed
export const seedToolkits = async (req, res) => {
  try {
    const existing = await Toolkit.countDocuments({ isOfficial: true });
    if (existing > 0) {
      return res.status(400).json({ message: 'Official toolkits already seeded.' });
    }

    const SEEDS = [
      {
        name: 'Freelancer Starter Kit',
        description: 'Everything a freelancer needs — from writing proposals to managing clients and delivering work faster.',
        emoji: '💼',
        color: 'indigo',
        tags: ['Freelance', 'Productivity', 'Writing'],
        categories: ['Writing', 'Productivity', 'Marketing'],
      },
      {
        name: 'Content Creator Pack',
        description: 'Create stunning videos, write viral captions, generate images, and publish consistently.',
        emoji: '🎬',
        color: 'rose',
        tags: ['Content', 'Video', 'Image'],
        categories: ['Video', 'Image', 'Writing'],
      },
      {
        name: 'Developer Toolbox',
        description: 'AI tools that make coding faster — from auto-complete to code review and debugging.',
        emoji: '💻',
        color: 'cyan',
        tags: ['Dev', 'Coding', 'API'],
        categories: ['Coding', 'Automation', 'Data'],
      },
      {
        name: 'Startup Growth Stack',
        description: 'Launch and grow your startup with AI tools for marketing, finance, and product development.',
        emoji: '🚀',
        color: 'amber',
        tags: ['Startup', 'Marketing', 'Finance'],
        categories: ['Marketing', 'Finance', 'Productivity'],
      },
      {
        name: 'Student Learning Bundle',
        description: 'Ace your studies with AI tutors, summarizers, quiz makers, and research assistants.',
        emoji: '🎓',
        color: 'emerald',
        tags: ['Education', 'Research', 'Writing'],
        categories: ['Education', 'Writing', 'Data'],
      },
      {
        name: 'Design & Creative Suite',
        description: 'From logo to brand identity — AI tools for designers, artists, and creative professionals.',
        emoji: '🎨',
        color: 'purple',
        tags: ['Design', 'Art', 'Brand'],
        categories: ['Design', 'Image', 'Video'],
      },
    ];

    const created = [];
    for (const seed of SEEDS) {
      const tools = await Tool.find({
        isApproved: { $ne: false },
        category: { $in: seed.categories },
      })
        .sort({ rating: -1 })
        .limit(8);

      if (tools.length > 0) {
        const kit = new Toolkit({
          name: seed.name,
          description: seed.description,
          emoji: seed.emoji,
          color: seed.color,
          tags: seed.tags,
          tools: tools.map(t => t._id),
          isOfficial: true,
        });
        await kit.save();
        created.push(kit.name);
      }
    }

    res.status(201).json({ message: `Seeded ${created.length} toolkits`, toolkits: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
