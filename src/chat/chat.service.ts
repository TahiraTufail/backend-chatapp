import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chatroom.entity';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private unorderedPair(a: number, b: number): number {
    // Ensure a <= b
    [a, b] = a < b ? [a, b] : [b, a];

    // Szudzik's pairing function
    return a < b ? b * b + a : a * a + a + b;
  }
  async createChatRoom(firstUserId: number, secondUserId: number) {
    try {
      const chatRoomId = this.unorderedPair(firstUserId, secondUserId);
      const existingChatRoom = await this.chatRoomRepository.findOne({
        where: {
          id: chatRoomId,
        },
        relations: ['messages'],
        order: { messages: { createdAt: 'ASC' } },
      });
      if (existingChatRoom) {
        return existingChatRoom;
      }
      const newChatRoom = this.chatRoomRepository.create({
        id: chatRoomId,
        firstUser: { id: firstUserId },
        secondUser: { id: secondUserId },
      });
      return await this.chatRoomRepository.save(newChatRoom);
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw new Error('Could not create chat room');
    }
  }

  async createMessage(
    messageId: string,
    content: string,
    senderId: number,
    recipientId: number,
    chatRoomId: number,
  ) {
    try {
      const messagesInRoom = await this.messageRepository.find({
        where: {
          chatRoom: { id: chatRoomId },
        },
      });
      const lastMessageOrder =
        messagesInRoom.length > 0
          ? messagesInRoom[messagesInRoom.length - 1].order
          : 0;
      const message = this.messageRepository.create({
        id: messageId,
        content: content,
        order: lastMessageOrder + 1,
        chatRoom: { id: chatRoomId },
        sender: { id: senderId },
        recipient: { id: recipientId },
        createdAt: new Date(),
      });
      return await this.messageRepository.save(message);
    } catch (error) {
      console.error('Can not create message', error);
      throw new Error('Could not create message');
    }
  }
}
