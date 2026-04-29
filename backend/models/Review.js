const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    tool: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tool'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true
    },
    userImage: {
        type: String
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per tool
reviewSchema.index({ tool: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
