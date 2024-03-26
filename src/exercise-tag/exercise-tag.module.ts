import { Module } from '@nestjs/common';
import { ExerciseTagService } from './exercise-tag.service';
import { ExerciseTagResolver } from './exercise-tag.resolver';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  providers: [ExerciseTagService, ExerciseTagResolver, PrismaService],
  exports: [ExerciseTagService],
})
export class ExerciseTagModule {}
