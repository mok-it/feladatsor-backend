import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistory } from '@prisma/client';

@Resolver('ExerciseHistory')
export class ExerciseHistoryResolver {
  constructor(
    private readonly exerciseHistoryService: ExerciseHistoryService,
    private readonly userService: UserService,
  ) {}

  @Query('exerciseHistoryByExercise')
  exerciseHistoryByExercise(@Args('id') id: string) {
    return this.exerciseHistoryService.getHistoryByExerciseId(id);
  }

  @ResolveField('createdBy')
  userForHistory(@Parent() exerciseHistory: ExerciseHistory) {
    return this.userService.getUserById(exerciseHistory.userId);
  }
}
