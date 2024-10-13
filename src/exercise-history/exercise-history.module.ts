import { Module } from '@nestjs/common';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistoryResolver } from './exercise-history.resolver';
import { UserModule } from '../user/user.module';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [UserModule],
  providers: [ExerciseHistoryResolver, ExerciseHistoryService, PrismaClient],
  exports: [ExerciseHistoryService],
})
export class ExerciseHistoryModule {}
