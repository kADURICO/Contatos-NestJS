import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './contacts/contacts.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ContactsModule, UsersModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
