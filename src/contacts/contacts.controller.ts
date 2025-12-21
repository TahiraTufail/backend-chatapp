import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/users/guards/jwt.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create.contact';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactService: ContactsService) {}

  @Post('add')
  addContact(@Body() dto: CreateContactDto, @Req() req: any) {
    return this.contactService.addContact(dto, req.user);
  }

  @Get('search')
  async search(@Req() req: any, @Query('q') q: string) {
    return this.contactService.searchContacts(req.user, q);
  }
  @Get()
  async getAll(@Req() req: any) {
    return this.contactService.getAllContacts(req.user);
  }

  @Delete('deleteContact/:id')
  async deleteContact(
    @Param('id') contactId: number,
    @Req() req: any, // or however you get the logged-in user
  ) {
    return this.contactService.deleteContact(contactId, req.user);
  }
}


