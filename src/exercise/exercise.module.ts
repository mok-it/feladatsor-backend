import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseResolver } from './exercise.resolver';

import { PrismaClient } from '@prisma/client';
@Module({
  providers: [ExerciseResolver, ExerciseService, PrismaClient],
})
export class ExerciseModule {}
