import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Contact } from 'src/contacts/entities/contact.entity';
import { Message } from 'src/chat/entities/message.entity';
import { ChatRoom } from 'src/chat/entities/chatroom.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private dataSource: DataSource,
    @InjectRepository(ChatRoom)
    private chatRoomRepo: Repository<ChatRoom>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    let user = await this.userRepo.findOneBy({
      phoneNumber: createUserDto.phoneNumber,
    });
    if (user) {
      throw new Error('This phone number is already in use');
    }
    user = await this.userRepo.findOneBy({ email: createUserDto.userEmail });
    if (user) {
      throw new Error('This email is already in use');
    }
    const trimmedPassword = createUserDto.password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const createdUser = this.userRepo.create({
      name: createUserDto.userName,
      email: createUserDto.userEmail,
      phoneNumber: createUserDto.phoneNumber,
      password: hashedPassword,
    });
    await this.userRepo.save(createdUser);
    //jwt token make
    const payload = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, userId: createdUser.id };
  }

  //update logic..
  async update(userId: number, updateUserDto: UpdateUserDto) {
    // 1. Find the user by ID
    let user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Check if the new phone number is already in use by another user
    if (updateUserDto.phoneNumber) {
      const phoneUser = await this.userRepo.findOneBy({
        phoneNumber: updateUserDto.phoneNumber,
      });
      if (phoneUser && phoneUser.id !== userId) {
        throw new Error('This phone number is already in use');
      }
    }

    // 3. Check if the new email is already in use by another user
    if (updateUserDto.userEmail) {
      const emailUser = await this.userRepo.findOneBy({
        email: updateUserDto.userEmail,
      });
      if (emailUser && emailUser.id !== userId) {
        throw new Error('This email is already in use');
      }
    }

    // 4. Update password if provided (with trimming)
    if (updateUserDto.password) {
      const trimmedPassword = updateUserDto.password.trim();
      user.password = await bcrypt.hash(trimmedPassword, 10);
    }

    // 5. Update other fields
    if (updateUserDto.userName) user.name = updateUserDto.userName;
    if (updateUserDto.userEmail) user.email = updateUserDto.userEmail;
    if (updateUserDto.phoneNumber) user.phoneNumber = updateUserDto.phoneNumber;
    if (updateUserDto.description !== undefined)
      user.description = updateUserDto.description;

    // 6. Save updated user
    await this.userRepo.save(user);

    return {
      name: user.name,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber,
      description: user.description,
    };
  }

  //LOGIN FUNCTIONALITY:
  async login(email: string, password: string) {
    // 1. Find user by email
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new Error('Invalid email');
    }

    // 2. Compare password with the hashed password in DB
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    // console.log('Password input:', password.trim());
    // console.log('Hashed in DB:', user.password);
    // console.log('Bcrypt compare result:', isMatch);
    if (!isMatch) {
      throw new Error('Invalid password');
    }

    // 3. Generate JWT token
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    console.log('LOGGED IN');
    return { access_token: accessToken, userId: user.id };
  }

  async deleteUserProfile(id: number) {
    const user = await this.userRepo.findOneBy({ id: id });
    if (!user) {
      return { message: 'This user is not available' };
    }

    // Use a transaction to ensure all deletions happen together
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find all chat rooms where this user is a participant
      const chatRooms = await queryRunner.manager
        .createQueryBuilder(ChatRoom, 'chatRoom')
        .where('chatRoom.firstUserId = :userId', { userId: id })
        .orWhere('chatRoom.secondUserId = :userId', { userId: id })
        .getMany();

      // 2. Delete all messages in those chat rooms
      for (const room of chatRooms) {
        await queryRunner.manager.delete(Message, {
          chatRoom: { id: room.id },
        });
      }

      // 3. Delete all chat rooms where this user is a participant
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(ChatRoom)
        .where('firstUserId = :userId', { userId: id })
        .orWhere('secondUserId = :userId', { userId: id })
        .execute();

      // 4. Delete all contacts where this user is the owner
      await queryRunner.manager.delete(Contact, { user: { id } });

      // 5. Delete all contacts where this user is saved as a contact
      await queryRunner.manager.delete(Contact, { contactUser: { id } });

      // 6. Delete any remaining messages sent by this user
      await queryRunner.manager.delete(Message, { sender: { id } });

      // 7. Delete any remaining messages received by this user
      await queryRunner.manager.delete(Message, { recipient: { id } });

      // 8. Finally, delete the user
      await queryRunner.manager.delete(User, { id });

      // Commit the transaction
      await queryRunner.commitTransaction();

      return { message: 'The user is deleted' };
    } catch (error) {
      // Rollback the transaction if anything fails
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async updateProfileDescription(id: string, description: string) {
    const newId = parseInt(id);
    const user = await this.userRepo.findOneBy({ id: newId });
    if (!user) {
      return { message: 'The user is not existed' };
    }
    user.description = description;
    await this.userRepo.save(user);
    return {
      description: user.description,
      name: user.name,
      message: `${name}'s description is now updated`,
    };
  }
  async searchUserByPhone(phoneNumber: string) {
    const user = await this.userRepo.findOne({
      where: {
        phoneNumber: phoneNumber,
      },
    });
    if (!user) {
      console.log('No such user with this phone number existed');
      throw new NotFoundException(
        'No such user with this phone number existed',
      );
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
  }
}
