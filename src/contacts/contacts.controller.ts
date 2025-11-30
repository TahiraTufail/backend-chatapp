import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/users/guards/jwt.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create.contact';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactService: ContactsService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  addContact(@Body() dto: CreateContactDto, @Req() req) {
    return this.contactService.addContact(dto, req.user);
  }

  @Get('search')
  async search(@Req() req, @Query('q') q: string) {
    return this.contactService.searchContacts(req.user, q);
  }
}
