import { Document, Types } from 'mongoose';
import { IChat } from './chat.interface';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  owner: any;
  text: string;
  chatId: IChat['_id'];
  wasRead: string[];
  isRead: boolean;
  isUpdates: boolean;
  createdDate: Date;
  updateDate: Date;
}
