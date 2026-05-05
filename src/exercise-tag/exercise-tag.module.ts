import { Module } from '@nestjs/common';
import { ExerciseTagService } from './exercise-tag.service';
import { ExerciseTagResolver } from './exercise-tag.resolver';

@Module({
  providers: [ExerciseTagService, ExerciseTagResolver],
  exports: [ExerciseTagService],
})
export class ExerciseTagModule {}
