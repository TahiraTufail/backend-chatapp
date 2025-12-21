import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class ChatRoom {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'firstUserId' })
  firstUser: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'secondUserId' })
  secondUser: User;

  @OneToMany(() => Message, (message) => message.chatRoom, { eager: true })
  messages: Message[];
}
