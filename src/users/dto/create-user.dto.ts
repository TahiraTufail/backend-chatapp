import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsSemVer,
  IsString,
  Length,
  length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: String;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;

  @IsString()
  description?: string;
}
