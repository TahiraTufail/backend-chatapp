import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ONLINE })
  status: UserStatus;

  @Column({ nullable: true }) // ✅ description is now optional
  description?: string;
}
