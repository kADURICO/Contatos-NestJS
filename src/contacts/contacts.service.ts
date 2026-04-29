import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactsService {
  private contacts: Contact[] = [];
  private idCounter: number = 1;

  create(createContactDto: CreateContactDto) {
    const newContact: Contact = {
      id: this.idCounter++,
      ...createContactDto,
    }
    this.contacts.push(newContact)
    return newContact;
  }

  findAll() {
    return this.contacts;
  }

  findOne(id: number) {
    const contact = this.contacts.find(u => u.id === id);
    if (!contact) throw new NotFoundException(`Contact ${id} not found.`)
    return contact;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    const contact = this.findOne(id);

    Object.assign(contact, updateContactDto);
    return contact;
  }

  remove(id: number) {
    this.findOne(id);
    
    this.contacts = this.contacts.filter(u => u.id !== id);
    return `Contact ${id} deleted.`;
  }
}
