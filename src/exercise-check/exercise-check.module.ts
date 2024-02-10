import { Module } from '@nestjs/common';
import { ExerciseCheckService } from './exercise-check.service';
import { ExerciseCheckResolver } from './exercise-check.resolver';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [ExerciseCheckResolver, ExerciseCheckService, PrismaClient],
  exports: [ExerciseCheckService],
})
export class ExerciseCheckModule {}
