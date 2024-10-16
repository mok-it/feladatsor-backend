import { Module } from '@nestjs/common';
import { ExerciseGroupService } from './exercise-group.service';
import { PrismaClient } from '@prisma/client';
import { ExerciseGroupResolver } from './exercise-group.resolver';

@Module({
  providers: [ExerciseGroupService, PrismaClient, ExerciseGroupResolver],
  exports: [ExerciseGroupService],
})
export class ExerciseGroupModule {}
