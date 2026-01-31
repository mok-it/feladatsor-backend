import { Module } from '@nestjs/common';
import { ExerciseSheetCommentService } from './exercise-sheet-comment.service';
import {
  ExerciseSheetCommentResolver,
  ExerciseSheetExtensionResolver,
  ExerciseSheetItemExtensionResolver,
  OrderedExerciseExtensionResolver,
} from './exercise-sheet-comment.resolver';
import { PrismaService } from '../prisma/PrismaService';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    ExerciseSheetCommentService,
    ExerciseSheetCommentResolver,
    PrismaService,
    ExerciseSheetExtensionResolver,
    ExerciseSheetItemExtensionResolver,
    OrderedExerciseExtensionResolver,
  ],
})
export class ExerciseSheetCommentModule {}
