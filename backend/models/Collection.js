import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
