import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { ChatSchema } from './_schemas/chat.schema';
import { ChatService } from './_services/chat.service';
import { ChatGateway } from './sockets/chat.gateway';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UserService } from './_services/user.service';
import { AccessTokenService } from './_services/access-token.service';
const SCHEMAS: Array<{ name: string, schema: Schema }> = [
  { name: 'Chat', schema: ChatSchema },
];

const SERVICES = [
  ChatService,
  AccessTokenService,
  UserService,
];

const SOCKETS = [
  ChatGateway,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `configs/${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : ''}.env`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongodbUri = configService.get('mongodb_uri');
        const mongodbName = configService.get('mongodb_name');
        return ({
          uri: `${mongodbUri}/${mongodbName}`,
          useFindAndModify: false,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(SCHEMAS),
  ],
  controllers: [],
  providers: [
    Logger,
    ...SERVICES,
    ...SOCKETS,
  ],
})
export class AppModule {}
