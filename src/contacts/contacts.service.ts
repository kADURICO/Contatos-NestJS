import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto, userId: number) {
    return this.prisma.contact.create({
      data: {
        ...createContactDto,
        userId,
      },
    });
  }

  async findAll(user: any) {
    if (user.role === Role.ADMIN) {
      return this.prisma.contact.findMany();
    }
    return this.prisma.contact.findMany({
      where: { userId: user.id },
    });
  }

  async findOne(id: number, user: any) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException(`Contact ${id} not found.`);
    
    if (user.role !== Role.ADMIN && contact.userId !== user.id) {
      throw new ForbiddenException('Acesso negado');
    }
    
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto, user: any) {
    await this.findOne(id, user); // verifica ownership
    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
    });
  }

  async remove(id: number, user: any) {
    await this.findOne(id, user); // verifica ownership
    await this.prisma.contact.delete({ where: { id } });
    return `Contact ${id} deleted.`;
  }
}
