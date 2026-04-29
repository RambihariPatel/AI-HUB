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
        required: true
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool'
    }],
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool'
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
