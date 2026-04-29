const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['Writing', 'Coding', 'Image', 'Video', 'Audio', 'Data', 'Productivity', 'Marketing', 'Education', 'Automation']
    },
    descriptionShort: { type: String, required: true },
    descriptionLong: { type: String, required: true },
    features: [{ type: String }],
    pricing: {
        type: String,
        required: true,
        enum: ['Free', 'Paid', 'Freemium']
    },
    plans: {
        free: { type: String },
        pro: { type: String },
        enterprise: { type: String }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    monthlyUsers: { type: Number, default: 0 },
    modelInfo: {
        modelName: { type: String },
        modelType: { type: String },
        freeAvailable: { type: Boolean, default: false },
        paidAvailable: { type: Boolean, default: false },
        credits: { type: String },
        apiAccess: { type: Boolean, default: false }
    },
    useCases: [{ type: String }],
    pros: [{ type: String }],
    cons: [{ type: String }],
    link: { type: String, required: true },
    logoUrl: { type: String },
    demoUrl: { type: String },
    popularityLevel: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'approved'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Tool = mongoose.model('Tool', toolSchema);
module.exports = Tool;
