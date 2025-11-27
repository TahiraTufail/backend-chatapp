import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard) // ✅ Protect route with JWT
  @Put('update')
  async update(
    @Param('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(userId, updateUserDto);
  }

  @Post('login')
  async authentication(@Body() body: { email: string; password: string }) {
    return await this.usersService.login(body.email, body.password);
  }

  @Delete('delete')
  async deleteUserProfile(@Body() body:{ id: string}){
    return await this.usersService.deleteUserProfile(body.id);
  }

  @Patch('descriptionupdate')
  async descriptionUpdation(@Body() body:{id:string, description:string}){
    return await this.usersService.updateProfileDescription(body.id, body.description);
  }
}
