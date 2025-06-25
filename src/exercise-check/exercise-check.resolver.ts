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
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver('ExerciseCheck')
export class ExerciseCheckResolver {
  constructor(
    private readonly exerciseCheckService: ExerciseCheckService,
    private readonly userService: UserService,
  ) {}

  @Mutation('createExerciseCheck')
  @UseGuards(RolesGuard)
  @Roles('CHECK_EXERCISE')
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
