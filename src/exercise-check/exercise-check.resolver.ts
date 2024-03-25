import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ExerciseCheckService } from './exercise-check.service';
import { ExerciseCheckInput } from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/user.auth.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { UseGuards } from '@nestjs/common';

@Resolver('exerciseCheck')
export class ExerciseCheckResolver {
  constructor(private readonly exerciseCheckService: ExerciseCheckService) {}

  @Mutation('createExerciseCheck')
  @UseGuards(JwtAuthGuard)
  async createExerciseCheck(
    @Args('data') data: ExerciseCheckInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseCheckService.createExerciseCheck(data, user);
  }
}
