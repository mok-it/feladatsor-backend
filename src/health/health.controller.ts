import { Controller, Get } from '@nestjs/common';

import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from 'src/auth/decorators/public.decorator';
import { PrismaHealthIndicator } from '../prisma/PrismaHealthIndicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
  ) {}

  @Get('liveness')
  @Public()
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  @Get('readiness')
  @Public()
  @HealthCheck()
  ready() {
    return this.health.check([async () => this.prisma.isHealthy('db')]);
  }
}
