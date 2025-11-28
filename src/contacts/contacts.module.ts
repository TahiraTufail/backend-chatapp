import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { Contact } from './entities/contact.entity';
import { User } from 'src/users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, User]),
    PassportModule,
    JwtModule.register({
      secret: 'your_secret_key'
    }),
  ],
  providers: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
