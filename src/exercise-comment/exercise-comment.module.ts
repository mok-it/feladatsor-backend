import { Module } from '@nestjs/common';
import { ExerciseCommentService } from './exercise-comment.service';
import { ExerciseCommentResolver } from './exercise-comment.resolver';
import { PrismaService } from 'src/prisma/PrismaService';

@Module({
  providers: [ExerciseCommentResolver, ExerciseCommentService, PrismaService],
  exports: [ExerciseCommentService],
})
export class ExerciseCommentModule {}
