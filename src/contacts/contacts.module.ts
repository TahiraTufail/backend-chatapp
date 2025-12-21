import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { Contact } from './entities/contact.entity';
import { User } from 'src/users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Message } from 'src/chat/entities/message.entity';
import { ChatRoom } from 'src/chat/entities/chatroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, User,Message,ChatRoom]),
    PassportModule,
    JwtModule.register({
      secret: 'your_secret_key'
    }),
  ],
  providers: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
