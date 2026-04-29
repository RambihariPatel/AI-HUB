const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    clerkId: {
        type: String,
        unique: true,
        sparse: true
    },
    imageUrl: {
        type: String
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool'
    }],
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool'
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
