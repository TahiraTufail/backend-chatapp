import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create.contact';
import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/chat/entities/message.entity';
import { ChatRoom } from 'src/chat/entities/chatroom.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactrepo: Repository<Contact>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepo: Repository<ChatRoom>,
    private dataSource: DataSource,
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
  async deleteContact(contactId: number, loggedInUser: any) {
    // 1. Find the contact and verify it belongs to the logged-in user
    const contact = await this.contactrepo.findOne({
      where: {
        id: contactId,
        user: { id: loggedInUser.id },
      },
      relations: ['contactUser'],
    });

    if (!contact) {
      throw new NotFoundException(
        'Contact not found or does not belong to you',
      );
    }

    // Use a transaction to ensure all deletions happen together
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Find chat room between logged-in user and the contact
      const chatRoom = await queryRunner.manager
        .createQueryBuilder(ChatRoom, 'chatRoom')
        .where(
          '(chatRoom.firstUserId = :userId AND chatRoom.secondUserId = :contactUserId)',
          {
            userId: loggedInUser.id,
            contactUserId: contact.contactUser?.id,
          },
        )
        .orWhere(
          '(chatRoom.firstUserId = :contactUserId AND chatRoom.secondUserId = :userId)',
          {
            userId: loggedInUser.id,
            contactUserId: contact.contactUser?.id,
          },
        )
        .getOne();

      // 3. If chat room exists, delete all messages in that chat room
      if (chatRoom) {
        await queryRunner.manager.delete(Message, {
          chatRoom: { id: chatRoom.id },
        });

        // 4. Delete the chat room
        await queryRunner.manager.delete(ChatRoom, { id: chatRoom.id });
      }

      // 5. Delete the contact entry
      await queryRunner.manager.delete(Contact, { id: contactId });

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'Contact and all associated messages deleted successfully',
        deletedContact: contact.phoneNumber,
      };
    } catch (error) {
      // Rollback the transaction if anything fails
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
