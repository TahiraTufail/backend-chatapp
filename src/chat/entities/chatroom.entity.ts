import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class ChatRoom {
  @PrimaryColumn()
  id: string;

  @Column()
  firstUserId: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'firstUserId' })
  firstUser: User;

  @Column()
  secondUserId: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'secondUserId' })
  secondUser: User;

  @OneToMany(() => Message, (message) => message.chatRoom)
  messages: Message;
}
