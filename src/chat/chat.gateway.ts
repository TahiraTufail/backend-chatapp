import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080, {
  transports: ['websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    console.log('websocket initialize....on port 8080');
  }
  async handleConnection(client: Socket) {
    //auth data extract
    const handShakeData = client.handshake.auth;
    const token = handShakeData.token;
    let payload: any;
    //authenticating the user..
    try {
      payload = await this.jwtService.verifyAsync(token);
      if (!payload) {
        client.disconnect(true);
        throw new Error('CLIENT IS NOT AUTHENTICATED');
      }
    } catch (error) {
      client.disconnect(true);
      throw new Error('FAILED TO VERIFY USER');
    }
    client.data.userId = payload.userId;
    client.data.name = payload.name;
    client.data.phoneNumber = payload.phoneNumber;
    client.data.email = payload.email;

    client.emit('connected', {
      connected: true,
    });
  }

  async handleDisconnect(client: Socket) {
    console.log('CLIENT DISCONNECTED');
  }
}
