import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: Number;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  phoneNumber: String;
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ONLINE })
  status: UserStatus;
  @Column()
  description: string;
}
