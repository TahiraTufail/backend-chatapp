import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create.contact';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactrepo: Repository<Contact>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async AddContact(createContact: CreateContactDto, user: CreateUserDto) {
    let contact = await this.userRepo.findOneBy({
      phoneNumber: createContact.phoneNumber,
    });
    if (!contact) {
      throw new BadRequestException('Phone Number is not available on CHATAPP');
    }

    let alreadySaved = await this.contactrepo.findOneBy({
      phoneNumber: createContact.phoneNumber,
    });
    if (alreadySaved) {
      throw new BadRequestException(
        `${createContact.phoneNumber} is already saved!`,
      );
    }
    if (createContact.phoneNumber === user.phoneNumber) {
      throw new BadRequestException('You cannot add yourself as a contact');
    }

    //add new contact....
  }
}
