import {
  IsPhoneNumber,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsPhoneNumber('PK') // PK = Pakistan
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  contactUserId?: number;
}
