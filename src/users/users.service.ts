import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

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
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = this.userRepo.create({
      name: createUserDto.userName,
      email: createUserDto.userEmail,
      phoneNumber: createUserDto.phoneNumber,
      password: hashedPassword
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

    // 4. Update password if provided
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
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

  //   findAll() {
  //     return `This action returns all users`;
  //   }

  //   findOne(id: number) {
  //     return `This action returns a #${id} user`;
  //   }

  //   update(id: number, updateUserDto: UpdateUserDto) {
  //     return `This action updates a #${id} user`;
  //   }

  //   remove(id: number) {
  //     return `This action removes a #${id} user`;
  //   }
}
