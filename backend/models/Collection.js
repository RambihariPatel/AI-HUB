const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    tools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool'
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// A user cannot have two collections with the same name
collectionSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);
