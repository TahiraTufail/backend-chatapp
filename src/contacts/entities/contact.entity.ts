import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

enum ContactStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  REMOVED = 'removed',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  // 👇 User who owns this contact list
  @ManyToOne(() => User, (user) => user.contacts, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  phoneNumber: string;

  // 👇 Optional: if the saved phoneNumber exists as a User
  @ManyToOne(() => User, (user) => user.addedAsContact, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'contactUserId' })
  contactUser?: User;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.ACTIVE })
  status: ContactStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
