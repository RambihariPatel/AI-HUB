import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Writing',
        'Coding',
        'Image',
        'Video',
        'Audio',
        'Data',
        'Productivity',
        'Marketing',
        'Education',
        'Automation',
        'Design',
        'Logo Maker',
        'Finance',
        'Legal',
        'HR',
        'Cybersecurity',
      ],
    },
    descriptionShort: {
      type: String,
      required: true,
    },
    descriptionLong: {
      type: String,
      required: true,
    },
    features: [String],
    pricing: {
      type: String,
      required: true,
      enum: ['Free', 'Paid', 'Freemium'],
    },
    plans: {
      free: String,
      pro: String,
      enterprise: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    monthlyUsers: {
      type: String,
      default: 'Unknown',
    },
    popularity: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    modelInfo: {
      modelName: String,
      modelType: String,
      freeAvailable: Boolean,
      paidAvailable: Boolean,
      credits: String,
      apiAccess: Boolean,
    },
    useCases: [String],
    pros: [String],
    cons: [String],
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '/placeholder-tool.png',
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Tool = mongoose.model('Tool', toolSchema);

export default Tool;
