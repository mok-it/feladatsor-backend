import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ExerciseOnExerciseSheetItem } from '.prisma/client';
import { ExerciseService } from '../../../exercise/exercise.service';
import { TalonItem } from '@prisma/client';

@Resolver('OrderedExercise')
export class OrderedExerciseResolver {
  constructor(private readonly exerciseService: ExerciseService) {}

  @ResolveField('exercise')
  getExerciseFromOrderedExercise(
    @Parent() parent: ExerciseOnExerciseSheetItem | TalonItem,
  ) {
    return this.exerciseService.getExerciseById(parent.exerciseId);
  }
}
