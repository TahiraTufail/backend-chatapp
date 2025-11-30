import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Contact } from 'src/contacts/entities/contact.entity';

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

  @Column({ nullable: true })
  description?: string;

  // 👇 User added these contacts
  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];

  // 👇 This user appears as someone’s saved contact
  @OneToMany(() => Contact, (contact) => contact.contactUser)
  addedAsContact: Contact[];
}
