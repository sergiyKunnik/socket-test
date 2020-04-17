import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../_services/user.service';
import { ChatService } from '../_services/chat.service';
import { AccessTokenService } from '../_services/access-token.service';
import { Logger } from '@nestjs/common';

// @WebSocketGateway()
@WebSocketGateway(3001)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer() private server: Server;

  constructor(
    private logger: Logger,
    private userService: UserService,
    private chatService: ChatService,
    private accessTokenService: AccessTokenService,
  ) {}

  public async handleConnection(
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.accessTokenService.verify(client.handshake.query.token);

    if (user) {
      await this.userService.update({
        id: user._id,
        dataToUpdate: {
          socketId: client.id,
          active: true
        }
      });
      client.handshake.query.user = user;
      this.logger.log('User was connected');
    } else {
      client.disconnect();
    }
  }

  public async handleDisconnect(
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.accessTokenService.verify(client.handshake.query.token);

    if (user) {
      await this.userService.update({
        id: user._id,
        dataToUpdate: {
          socketId: null,
          active: false
        }
      });
      client.handshake.query.user = null;
    }
  }

  @SubscribeMessage('all-chats')
  public async getChats(client: Socket): Promise<any> {
    // await this.userService.ping()
    const user = client.handshake.query.user;
    let chats = await this.chatService.getChatsByUserId(user);
    // 5e96458e1da229929d8da522
    chats = await this.chatService.handleChats(user.id, chats);
    client.broadcast.to(client.id).emit('all-chats-response', chats);
  }

  @SubscribeMessage('create-chat')
  public async createChat(client: Socket, data: any): Promise<any> {
    // data
    // {
    //   name: string,
    //   user: string
    // }
    const user = client.handshake.query.user;
    let chat = await this.chatService.create({
      users: [data.user, user._id],
    });
    const anotherUser = await this.userService.findOne({_id: data.user});
    // client.broadcast.to()
    chat = await this.chatService.handleChat(user._id, chat);
    client.emit('new-chat', chat);
    if (anotherUser.active) {
      chat = await this.chatService.handleChat(anotherUser._id, chat);
      client.broadcast.to(anotherUser.socketId).emit('new-chat', chat);
    }
    return data;
  }

  @SubscribeMessage('create-group-chat')
  createGroupChat(client: Socket, data: string): string {
    // data
    // {
    //   name: string,
    //   users: string[]
    // }
    return data;
  }
  // @SubscribeMessage('events')
  // findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  // }

  // @SubscribeMessage('identity')
  // async identity(@MessageBody() data: number): Promise<number> {
  //   return data;
  // }
}