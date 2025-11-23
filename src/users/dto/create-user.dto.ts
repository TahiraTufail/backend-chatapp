import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: String;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  userEmail: String;

  @IsString()
  @IsNotEmpty()
  phoneNumber: String;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: String;
}
