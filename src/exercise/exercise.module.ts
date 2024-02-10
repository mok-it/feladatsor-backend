import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseResolver } from './exercise.resolver';

import { PrismaClient } from '@prisma/client';
import { ExerciseCheckModule } from '../exercise-check/exercise-check.module';

@Module({
  imports: [ExerciseCheckModule],
  providers: [ExerciseResolver, ExerciseService, PrismaClient],
  exports: [ExerciseService],
})
export class ExerciseModule {}
