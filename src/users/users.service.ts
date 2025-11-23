import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
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
    const hashedPassword = bcrypt.hash(createUserDto.password, 10);
    const createdUser = this.userRepo.create({
      name: createUserDto.userName,
      email: createUserDto.userEmail,
      phoneNumber: createUserDto.phoneNumber,
      password: hashedPassword,
    });
    this.userRepo.save(createdUser);
    //jwt token make
    const payload = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
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
