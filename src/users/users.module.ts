import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { Contact } from 'src/contacts/entities/contact.entity';
import { Message } from 'src/chat/entities/message.entity';
import { ChatRoom } from 'src/chat/entities/chatroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Contact, Message,ChatRoom]),
    PassportModule,
    JwtModule.register({
      secret: 'your_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
