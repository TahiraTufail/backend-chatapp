import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create.contact';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactrepo: Repository<Contact>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  //How it is working...createContactdto ayega aur jwt header se userID(jo contact add kar raha ha..like me adding atika so yahan mera header jayega) a
  // ab baki cheezein wohi rahein gi same

  async addContact(createContact: CreateContactDto, loggedInUser: any) {
    // 1. Cannot add yourself
    if (loggedInUser.phoneNumber === createContact.phoneNumber) {
      console.log('You cannot add yourself as a contact');
      throw new BadRequestException('You cannot add yourself as a contact');
    }

    // 2. Check if contact exists in USER table
    const contactUser = await this.userRepo.findOneBy({
      phoneNumber: createContact.phoneNumber,
    });

    if (!contactUser) {
      throw new BadRequestException('Phone Number is not available on CHATAPP');
      // console.log('Phone Number is not available on CHATAPP');
    }

    // 3. Check if already saved under this user
    const alreadyExists = await this.contactrepo.findOneBy({
      user: { id: loggedInUser.id },
      phoneNumber: createContact.phoneNumber,
    });

    if (alreadyExists) {
      throw new BadRequestException(
        `${createContact.phoneNumber} is already saved!`,
      );
    }

    // 4. Create contact entry
    const newContact = this.contactrepo.create({
      user: { id: loggedInUser.id },
      phoneNumber: createContact.phoneNumber,
      contactUser: { id: contactUser.id },
    });

    // 5. Save to DB
    return await this.contactrepo.save(newContact);
  }

  async searchContacts(loggedInUser: any, query: string) {
    const search = `%${query}%`;

    const contacts = await this.contactrepo.find({
      where: [
        // 1. Search by phone number (from Contact)ILike query is for case insensitivity
        {
          user: { id: loggedInUser.id },
          phoneNumber: ILike(search),
        },

        // 2. Search by name (from related User)
        {
          user: { id: loggedInUser.id },
          contactUser: {
            name: ILike(search),
          },
        },
      ],
      relations: ['contactUser'],
    });

    return contacts;
  }

  async getAllContacts(loggedInUser: any) {
    const contacts = await this.contactrepo.find({
      where: {
        user: { id: loggedInUser.id },
      },
      relations: ['contactUser'],
      order: {
        createdAt: 'DESC', // Optional: order by most recently added
      },
    });

    return contacts;
  }
}
