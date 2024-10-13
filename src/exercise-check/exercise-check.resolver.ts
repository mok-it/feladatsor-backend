import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseCheckService } from './exercise-check.service';
import { ExerciseCheckInput } from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { ExerciseCheck, User } from '@prisma/client';
import { UserService } from '../user/user.service';

@Resolver('ExerciseCheck')
export class ExerciseCheckResolver {
  constructor(
    private readonly exerciseCheckService: ExerciseCheckService,
    private readonly userService: UserService,
  ) {}

  @Mutation('createExerciseCheck')
  async createExerciseCheck(
    @Args('data') data: ExerciseCheckInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseCheckService.createExerciseCheck(data, user);
  }

  @ResolveField('user')
  async resolveUserForExerciseCheck(@Parent() exerciseCheck: ExerciseCheck) {
    return this.userService.getUserById(exerciseCheck.userId);
  }
}
