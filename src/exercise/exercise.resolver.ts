import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseService } from './exercise.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';
import { Exercise, ExerciseInput } from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/user.auth.decorator';
import { User } from '@prisma/client';

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(private readonly exerciseService: ExerciseService) {}

  @UseGuards(JwtAuthGuard)
  @Query('exercises')
  async getExercises(@Args('take') take: number, @Args('skip') skip: number) {
    return this.exerciseService.getExercises(take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query('exercisesCount')
  async getExercisesCount() {
    return this.exerciseService.getExercisesCount();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('createExercise')
  async createExercise(
    @Args('input') data: ExerciseInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseService.createExercise(data, user);
  }

  @ResolveField('similarExercises')
  async getSimilarExercises(@Parent() exercise: Exercise) {
    return this.exerciseService.getSimilarExercises(exercise.id);
  }

  //TODO: Move this out into a exerciseHistoryService
  @ResolveField('history')
  async getHistory(@Parent() exercise: Exercise) {
    return this.exerciseService.getHistory(exercise.id);
  }
}
