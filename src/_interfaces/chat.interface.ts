import { Document, Types } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId;
  users: any[];
  created: Date;
  isPublic: boolean;
  name: string;
}
