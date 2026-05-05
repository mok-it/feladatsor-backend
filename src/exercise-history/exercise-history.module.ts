import { Module } from '@nestjs/common';
import { ExerciseHistoryService } from './exercise-history.service';
import {
  ExerciseHistoryResolver,
  HistoryValueResolver,
} from './exercise-history.resolver';
import { UserModule } from '../user/user.module';
import { ImageModule } from '../image/image.module';
import { ExerciseTagModule } from '../exercise-tag/exercise-tag.module';

@Module({
  imports: [UserModule, ImageModule, ExerciseTagModule],
  providers: [
    ExerciseHistoryResolver,
    HistoryValueResolver,
    ExerciseHistoryService,
  ],
  exports: [ExerciseHistoryService],
})
export class ExerciseHistoryModule {}
