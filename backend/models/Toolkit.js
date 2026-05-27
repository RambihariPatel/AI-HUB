import mongoose from 'mongoose';

const toolkitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      default: '🧰',
    },
    color: {
      // Tailwind color token e.g. 'indigo', 'rose', 'amber'
      type: String,
      default: 'indigo',
    },
    tools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool',
      },
    ],
    // Who curated it — null = official/admin kit
    curatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isOfficial: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

const Toolkit = mongoose.model('Toolkit', toolkitSchema);
export default Toolkit;
