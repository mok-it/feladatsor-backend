import { Module } from '@nestjs/common';
import { StatService } from './stat.service';
import { StatResolver } from './stat.resolver';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  providers: [StatResolver, StatService, PrismaService],
})
export class StatModule {}
