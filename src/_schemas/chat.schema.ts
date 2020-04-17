import { Schema } from 'mongoose';

export const ChatSchema: Schema = new Schema({
  _id: Schema.Types.ObjectId,
  created: {
    default: new Date(),
    required: false,
    type: Date,
  },
  name: {
    required: false,
    type: String,
  },
  isPublic: {
    default: false,
    required: true,
    type: Boolean,
  },
  users: [{
    default: [],
    required: true,
    type: String,
  }],
});
