import { Module } from '@nestjs/common';
import { ExerciseCheckService } from './exercise-check.service';
import { ExerciseCheckResolver } from './exercise-check.resolver';
import { UserModule } from '../user/user.module';
import { ExerciseCommentModule } from '../exercise-comment/exercise-comment.module';

@Module({
  imports: [UserModule, ExerciseCommentModule],
  providers: [ExerciseCheckResolver, ExerciseCheckService],
  exports: [ExerciseCheckService],
})
export class ExerciseCheckModule {}
