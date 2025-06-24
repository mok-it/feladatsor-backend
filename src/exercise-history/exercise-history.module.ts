import { Module } from '@nestjs/common';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistoryResolver, HistoryValueResolver } from './exercise-history.resolver';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/PrismaService';
import { ImageModule } from '../image/image.module';
import { ExerciseTagModule } from '../exercise-tag/exercise-tag.module';

@Module({
  imports: [UserModule, ImageModule, ExerciseTagModule],
  providers: [ExerciseHistoryResolver, HistoryValueResolver, ExerciseHistoryService, PrismaService],
  exports: [ExerciseHistoryService],
})
export class ExerciseHistoryModule {}
