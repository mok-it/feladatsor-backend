import { Module } from '@nestjs/common';
import { ExerciseSheetItemService } from './exercise-sheet-item.service';
import { ExerciseSheetItemResolver } from './exercise-sheet-item.resolver';
import { PrismaService } from '../../prisma/PrismaService';
import { OrderedExerciseResolver } from './orderd-exercise/ordered-exercise.resolver';
import { ExerciseService } from '../../exercise/exercise.service';
import { ExerciseGroupService } from '../../exercise-group/exercise-group.service';

@Module({
  providers: [
    ExerciseGroupService,
    ExerciseSheetItemResolver,
    ExerciseSheetItemService,
    PrismaService,
    ExerciseService,
    OrderedExerciseResolver,
  ],
})
export class ExerciseSheetItemModule {}
