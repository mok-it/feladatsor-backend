import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseResolver } from './exercise.resolver';

import { PrismaClient } from '@prisma/client';
import { ExerciseCheckModule } from '../exercise-check/exercise-check.module';
import { ExerciseSearchService } from './exercise-search.service';
import { ExerciseTagModule } from '../exercise-tag/exercise-tag.module';
import { ImageModule } from '../image/image.module';
import { ExerciseCommentModule } from 'src/exercise-comment/exercise-comment.module';

@Module({
  imports: [
    ExerciseCheckModule,
    ExerciseTagModule,
    ImageModule,
    ExerciseCommentModule,
  ],
  providers: [
    ExerciseResolver,
    ExerciseService,
    ExerciseSearchService,
    PrismaClient,
  ],
  exports: [ExerciseService, ExerciseSearchService],
})
export class ExerciseModule {}
