import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IChat } from '../_interfaces/chat.interface';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private client: ClientProxy;
  constructor(
    private configService: ConfigService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('user_ms_host'),
        port: this.configService.get<number>('user_ms_port'),
      }
    });
  }

  public getUserName(user) {
    let name = null;
    if (user.fullName) name = user.fullName;
    else if (user.name) name = user.name;
    else if (user.firstName && user.lastName ) name = `${user.firstName} ${user.lastName}`
    else if (user.email) name = user.email;
    else name = user._id
    return name;
  }

  public async ping() {
    try {
      const data1 = await this.client.send('user-create', {
        email: 'vatslav@gmail.com',
        password: 'sergiy123'
      }).toPromise()
      const data12= await this.client.send('user-find', {}).toPromise();
      console.log('hello')
    } catch(error) {
      console.log('error => ', error)
    }
  }

  public async update({id, dataToUpdate}: {id: string, dataToUpdate: any}) {
    const response = await this.client.send('user-update', {
      ...dataToUpdate,
      id,
    }).toPromise();
    return response;
  }
  public async findOne(query: any) {
    const response = await this.client.send('user-findOne', query ).toPromise();
    return response;
  }
  // public async create({ users, isPublic = false }: {
  //   users: string[],
  //   isPublic: boolean,
  // }) {
  //   const newChat = await this.ChatModel.create({
  //     _id: Types.ObjectId(),
  //     created: new Date(),
  //     isPublic,
  //     users,
  //   });
  //   return newChat;
  // }

  // public async addUserToChat({chatId, users}: {
  //   users: string[],
  //   chatId: string,
  // }) {
  //   const chat = await this.ChatModel.findById(chatId);
  //   chat.users.push(...users);
  //   await chat.save();
  //   return await this.ChatModel.findById(chatId);
  // }

}
