import {Module} from '@nestjs/common';
import {ExerciseService} from './exercise.service';
import {ExerciseResolver} from './exercise.resolver';
import {ExerciseCheckModule} from '../exercise-check/exercise-check.module';
import {ExerciseSearchService} from './exercise-search.service';
import {ExerciseTagModule} from '../exercise-tag/exercise-tag.module';
import {ImageModule} from '../image/image.module';
import {ExerciseCommentModule} from '../exercise-comment/exercise-comment.module';
import {UserModule} from '../user/user.module';
import {ExerciseHistoryModule} from '../exercise-history/exercise-history.module';
import {PrismaService} from "../prisma/PrismaService";

@Module({
  imports: [
    ExerciseCheckModule,
    ExerciseTagModule,
    ImageModule,
    ExerciseCommentModule,
    UserModule,
    ExerciseHistoryModule,
  ],
  providers: [
    ExerciseResolver,
    ExerciseService,
    ExerciseSearchService,
    PrismaService,
  ],
  exports: [ExerciseService, ExerciseSearchService],
})
export class ExerciseModule {}
