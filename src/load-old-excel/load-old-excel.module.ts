import { Module } from '@nestjs/common';
import { LoadOldExcelService } from './load-old-excel.service';
import { LoadOldExcelController } from './load-old-excel.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Config } from '../config/config';
import { PrismaService } from '../prisma/PrismaService';
import { UserModule } from '../user/user.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { ImageModule } from '../image/image.module';
import { ExerciseCommentModule } from '../exercise-comment/exercise-comment.module';
import { ExerciseGroupModule } from '../exercise-group/exercise-group.module';

@Module({
  imports: [
    MulterModule,
    Config,
    ExerciseModule,
    UserModule,
    ImageModule,
    ExerciseCommentModule,
    ExerciseGroupModule,
  ],
  controllers: [LoadOldExcelController],
  providers: [LoadOldExcelService, PrismaService],
})
export class LoadOldExcelModule {}
