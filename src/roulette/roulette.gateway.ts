import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'http';

@WebSocketGateway({ namespace: '/roulette' })
export class RouletteGateway implements OnGatewayInit {
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('RouletteGateway');

  afterInit(server: any) {
    this.logger.log('Initialized');
  }

  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, message: { sender: string; message: string }) {
    this.wss.emit('msgToClient', message);
  }
}
