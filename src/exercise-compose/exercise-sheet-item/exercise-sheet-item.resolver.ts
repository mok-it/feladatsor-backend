import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ExerciseSheetItemService } from './exercise-sheet-item.service';
import { ExerciseSheetItem as PrismaExerciseSheetItem } from '.prisma/client';

@Resolver('ExerciseSheetItem')
export class ExerciseSheetItemResolver {
  constructor(
    private readonly exerciseSheetItemService: ExerciseSheetItemService,
  ) {}

  @ResolveField('exercises')
  resolveSheetItemsExercises(@Parent() parent: PrismaExerciseSheetItem) {
    return this.exerciseSheetItemService.getExercisesBySheetItemId(parent.id);
  }
}
