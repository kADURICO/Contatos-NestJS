import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({
      data: createContactDto,
    });
  }

  async findAll() {
    return this.prisma.contact.findMany();
  }

  async findOne(id: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contact ${id} not found.`);
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    await this.findOne(id);
    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.contact.delete({ where: { id } });
    return `Contact ${id} deleted.`;
  }
}
