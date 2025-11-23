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
  name: String;
  @Column()
  email: String;
  @Column()
  password: String;
  @Column()
  phoneNumber: String;
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ONLINE })
  status: UserStatus;
}
