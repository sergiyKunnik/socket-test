import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IChat } from '../_interfaces/chat.interface';
import { UserService } from './user.service';
@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat') private readonly ChatModel: Model<IChat>,
    private userService: UserService,
  ) {}

  public async create({ users, isPublic = false }: {
    users: string[],
    isPublic?: boolean,
  }) {
    try {
      const newChat = await this.ChatModel.create({
        _id: Types.ObjectId(),
        created: new Date(),
        isPublic,
        users,
      });
      return newChat;
    } catch (error) {
      console.log('error => ', error)
    }
  }

  public async addUserToChat({chatId, users}: {
    users: string[],
    chatId: string,
  }) {
    const chat = await this.ChatModel.findById(chatId);
    chat.users.push(...users);
    await chat.save();
    return await this.ChatModel.findById(chatId);
  }
  public async getChatsByUserId(userId) {
    return await this.ChatModel.find({ users: userId });
  }

  public async handleChat(userId: string, chat: IChat) {
    // chat.users
    chat.users = chat.users.filter((user) => {
      return user.toString() !== userId.toString();
    } );
    chat.users = await Promise.all(chat.users.map(async (user) => {
      return await this.userService.findOne({_id: user});
    }));
    if (!chat.name) {
      if (chat.users.length === 1) {
        chat.name = this.userService.getUserName(chat.users[0])
      } else if (chat.users.length > 1) {
        const userNames = chat.users.map((user) => {
          return this.userService.getUserName(user);
        });

        chat.name = userNames.join(', ');
      }
    }

    return chat;
  }
  public async handleChats(userId: string, chats: IChat[]) {
    return await Promise.all(chats.map(async (chat: IChat) => await this.handleChat(userId, chat)));
  }

}
