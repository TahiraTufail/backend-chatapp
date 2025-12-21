import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from './chatroom.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryColumn()
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages)
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  recipient: User;

  @Column()
  order: number;

  @Column()
  createdAt: Date;
}
