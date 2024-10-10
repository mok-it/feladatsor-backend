import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ExerciseCheckService } from './exercise-check.service';
import { ExerciseCheckInput } from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/user.auth.decorator';
import { User } from '@prisma/client';

@Resolver('exerciseCheck')
export class ExerciseCheckResolver {
  constructor(private readonly exerciseCheckService: ExerciseCheckService) {}

  @Mutation('createExerciseCheck')
  async createExerciseCheck(
    @Args('data') data: ExerciseCheckInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseCheckService.createExerciseCheck(data, user);
  }
}
