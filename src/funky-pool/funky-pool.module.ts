import { Module } from '@nestjs/common';
import { FunkyPoolService } from './funky-pool.service';
import { FunkyPoolResolver } from './funky-pool.resolver';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  providers: [PrismaService, FunkyPoolResolver, FunkyPoolService],
})
export class FunkyPoolModule {}
