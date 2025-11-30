import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

enum ContactStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  REMOVED = 'removed',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // User who added the contact
//bohat saare user aik owner.
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  phoneNumber: string; // Phone number of contact (can be anyone, not in User table)

  @Column({ nullable: true })
  contactUserId?: number; // If contact exists in User table

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'contactUserId' })
  contactUser?: User;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.ACTIVE })
  status?: ContactStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
