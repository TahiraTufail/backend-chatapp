import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
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
    return { accessToken };
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
    return { accessToken };
  }

  async deleteUserProfile(id: string) {
    const newId = parseInt(id);
    const user = await this.userRepo.findOneBy({ id: newId });
    if (!user) {
      return { message: 'This user is not available' };
    }
    await this.userRepo.remove(user);
    await this.userRepo.save(user);
    return { message: 'The user is deleted' };
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
