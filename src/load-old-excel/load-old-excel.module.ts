import { Module } from '@nestjs/common';
import { LoadOldExcelService } from './load-old-excel.service';
import { LoadOldExcelController } from './load-old-excel.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Config } from '../config/config';
import { UserModule } from '../user/user.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { ImageModule } from '../image/image.module';
import { ExerciseCommentModule } from '../exercise-comment/exercise-comment.module';
import { ExerciseGroupModule } from '../exercise-group/exercise-group.module';
import { ExerciseCheckModule } from '../exercise-check/exercise-check.module';

@Module({
  imports: [
    MulterModule,
    Config,
    ExerciseModule,
    UserModule,
    ImageModule,
    ExerciseCommentModule,
    ExerciseGroupModule,
    ExerciseCheckModule,
  ],
  controllers: [LoadOldExcelController],
  providers: [LoadOldExcelService],
})
export class LoadOldExcelModule {}
