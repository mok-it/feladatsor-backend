import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from '../prisma/PrismaHealthIndicator';

@Module({
  imports: [TerminusModule],
  providers: [PrismaHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
