import { Module } from '@nestjs/common';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistoryResolver } from './exercise-history.resolver';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  imports: [UserModule],
  providers: [ExerciseHistoryResolver, ExerciseHistoryService, PrismaService],
  exports: [ExerciseHistoryService],
})
export class ExerciseHistoryModule {}
