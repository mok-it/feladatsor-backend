import { Module } from '@nestjs/common';
import { ExerciseCheckService } from './exercise-check.service';
import { ExerciseCheckResolver } from './exercise-check.resolver';
import { PrismaClient } from '@prisma/client';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [ExerciseCheckResolver, ExerciseCheckService, PrismaClient],
  exports: [ExerciseCheckService],
})
export class ExerciseCheckModule {}
