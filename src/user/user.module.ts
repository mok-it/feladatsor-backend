import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [UserResolver, UserService, PrismaClient],
  exports: [UserService],
})
export class UserModule {}
