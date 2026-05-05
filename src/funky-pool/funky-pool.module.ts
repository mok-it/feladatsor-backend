import { Module } from '@nestjs/common';
import { FunkyPoolService } from './funky-pool.service';
import { FunkyPoolResolver } from './funky-pool.resolver';

@Module({
  providers: [FunkyPoolResolver, FunkyPoolService],
})
export class FunkyPoolModule {}
