import Review from '../models/Review.js';
import Tool from '../models/Tool.js';

// @desc    Create new review
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  const { rating, comment, toolId, screenshot } = req.body;

  try {
    const tool = await Tool.findById(toolId);

    if (tool) {
      const alreadyReviewed = await Review.findOne({
        user: req.user._id,
        tool: toolId,
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Tool already reviewed' });
      }

      const review = new Review({
        userName: req.user.name,
        rating: Number(rating),
        comment,
        screenshot: screenshot || '',
        user: req.user._id,
        tool: toolId,
      });

      await review.save();

      // Update tool rating
      const reviews = await Review.find({ tool: toolId });
      tool.numReviews = reviews.length;
      tool.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await tool.save();

      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a tool
// @route   GET /api/reviews/:toolId
export const getToolReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tool: req.params.toolId }).sort({
      createdAt: -1,
    });

    // Populate badges dynamically for each review
    const populatedReviews = await Promise.all(
      reviews.map(async (review) => {
        const userId = review.user;
        const count = await Review.countDocuments({ user: userId });
        const userReviews = await Review.find({ user: userId });
        const totalUpvotes = userReviews.reduce((sum, r) => sum + (r.helpfulVotes?.length || 0), 0);

        const badges = [];
        if (review.screenshot) {
          badges.push('Verified Creator');
        }
        if (count >= 5 || totalUpvotes >= 3) {
          badges.push('Power User');
        } else if (count >= 3) {
          badges.push('Expert Reviewer');
        }

        return {
          ...review.toObject(),
          badges,
        };
      })
    );

    res.json(populatedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle helpful vote for a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const toggleHelpfulVote = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = review.helpfulVotes.some(id => id.toString() === userId.toString());

    if (hasUpvoted) {
      // Remove upvote
      review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add upvote
      review.helpfulVotes.push(userId);
    }

    await review.save();

    // Return review with dynamic badges
    const reviewerId = review.user;
    const count = await Review.countDocuments({ user: reviewerId });
    const userReviews = await Review.find({ user: reviewerId });
    const totalUpvotes = userReviews.reduce((sum, r) => sum + (r.helpfulVotes?.length || 0), 0);

    const badges = [];
    if (review.screenshot) {
      badges.push('Verified Creator');
    }
    if (count >= 5 || totalUpvotes >= 3) {
      badges.push('Power User');
    } else if (count >= 3) {
      badges.push('Expert Reviewer');
    }

    res.json({
      ...review.toObject(),
      badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
