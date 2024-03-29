import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseResolver } from './exercise.resolver';

import { PrismaClient } from '@prisma/client';
import { ExerciseCheckModule } from '../exercise-check/exercise-check.module';
import { ExerciseSearchService } from './exercise-search.service';
import { ExerciseTagModule } from '../exercise-tag/exercise-tag.module';

@Module({
  imports: [ExerciseCheckModule, ExerciseTagModule],
  providers: [
    ExerciseResolver,
    ExerciseService,
    ExerciseSearchService,
    PrismaClient,
  ],
  exports: [ExerciseService, ExerciseSearchService],
})
export class ExerciseModule {}
