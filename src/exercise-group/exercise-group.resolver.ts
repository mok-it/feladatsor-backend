import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ExerciseGroupService } from './exercise-group.service';
import { SameLogicExerciseGroupInput } from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { User } from '@prisma/client';

@Resolver()
export class ExerciseGroupResolver {
  constructor(private readonly exerciseGroupService: ExerciseGroupService) {}

  @Query('sameLogicExerciseGroups')
  sameLogicExerciseGroups() {
    return this.exerciseGroupService.getSameLogicExerciseGroups();
  }

  @Mutation('createSameLogicExerciseGroup')
  createSameLogicExerciseGroup(
    @Args('data') data: SameLogicExerciseGroupInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseGroupService.createSameLogicExerciseGroup(data, user);
  }
}
