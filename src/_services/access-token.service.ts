import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IChat } from '../_interfaces/chat.interface';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenService {
  private client: ClientProxy;
  constructor(
    private configService: ConfigService,
  ) {
    const port = this.configService.get<number>('user_ms_port');
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.configService.get<string>('user_ms_host'),
        port: this.configService.get<number>('user_ms_port'),
      }
    });
  }

  public async verify(token: string) {
    return await this.client.send('access-token-verify', {token}).toPromise();
  }
}
