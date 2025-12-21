import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { CreateChatRoom, Message } from './types/chat.types';
import { ChatService } from './chat.service';
import { Body } from '@nestjs/common/decorators';

// websocket work on event based communication / event driven architecture.
// each event will have a name and data associated with it.
// clients can listen to those events and can also emit events to the server.
//server subscribes to those events using @SubscribeMessage decorator.
//clients can listen to those events using socket.on('eventName', callback);

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

  private static connectedSockets: Record<string, Socket> = {};

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

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
    client.data.userId = payload.id;
    client.data.name = payload.name;
    client.data.phoneNumber = payload.phoneNumber;
    client.data.email = payload.email;

    ChatGateway.connectedSockets[client.data.userId] = client;

    client.emit('connected', {
      connected: true,
    });
  }

  async handleDisconnect(client: Socket) {
    console.log('CLIENT DISCONNECTED');
    delete ChatGateway.connectedSockets[client.data.userId];
  }

  @SubscribeMessage('create-chat-room')
  async handleCreateChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateChatRoom,
  ) {
    const { secondUserId } = payload;
    const firstUserId = client.data.userId;
    try {
      const chatRoom = await this.chatService.createChatRoom(
        firstUserId,
        secondUserId,
      );
      await client.join(`room:${chatRoom.id}`);
      client.emit('chat-room-joined', {
        chatRoomDetails: chatRoom,
        createdBy: firstUserId,
        secondUserId: secondUserId,
      });
      const secondUserSocket = ChatGateway.connectedSockets[secondUserId];
      if (secondUserSocket) {
        await secondUserSocket.join(`room:${chatRoom.id}`);
      }
    } catch (error) {
      console.error('Error in handleCreateChatRoom:', error);
      client.emit('error', { error: error });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: Message,
  ) {
    try {
      const createdMessage = await this.chatService.createMessage(
        payload.messageId,
        payload.content,
        client.data.userId,
        payload.recipientId,
        payload.roomId,
      );
      client.emit('message-sent', createdMessage);
      this.server
        .to(`room:${payload.roomId}`)
        .except(client.id)
        .emit('new-message', createdMessage);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      client.emit('error', { error: error });
    }
  }
}
