import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter: number = 1;

  create(createUserDto: CreateUserDto) {
    const newUser: User = {
      id: this.idCounter++,
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.push(newUser)
    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found.`)
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.findOne(id);

    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();

    return user;
  }

  remove(id: number) {
    this.findOne(id);
    
    this.users = this.users.filter(u => u.id !== id);
    return `User ${id} deleted.`;
  }
}
