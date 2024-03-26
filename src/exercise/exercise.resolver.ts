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
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import {
  Exercise,
  ExerciseInput,
  ExerciseSearchQuery,
} from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/user.auth.decorator';
import { User } from '@prisma/client';
import { ExerciseCheckService } from '../exercise-check/exercise-check.service';
import { ExerciseSearchService } from './exercise-search.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExerciseTagService } from '../exercise-tag/exercise-tag.service';

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseTagService: ExerciseTagService,
    private readonly exerciseSearchService: ExerciseSearchService,
    private readonly exerciseCheckService: ExerciseCheckService,
  ) {}

  @Query('exercises')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getExercises(@Args('take') take: number, @Args('skip') skip: number) {
    return this.exerciseService.getExercises(take, skip);
  }

  @Query('exercisesCount')
  @UseGuards(JwtAuthGuard)
  async getExercisesCount() {
    return this.exerciseService.getExercisesCount();
  }

  @Query('searchExercises')
  @UseGuards(JwtAuthGuard)
  async searchExercises(@Args('query') query: ExerciseSearchQuery) {
    return this.exerciseSearchService.searchExercises(query);
  }

  @Mutation('createExercise')
  @UseGuards(JwtAuthGuard)
  async createExercise(
    @Args('input') data: ExerciseInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseService.createExercise(data, user);
  }

  @ResolveField('alternativeDifficultyExercises')
  async getAlternativeDifficultyExercises(@Parent() exercise: Exercise) {
    return this.exerciseService.getAlternativeDifficultyExercises(exercise.id);
  }

  //TODO: Move this out into a exerciseHistoryService
  @ResolveField('history')
  async getHistory(@Parent() exercise: Exercise) {
    return this.exerciseService.getHistory(exercise.id);
  }

  @ResolveField('checks')
  async getChecks(@Parent() exercise: Exercise) {
    return this.exerciseCheckService.getChecksByExerciseId(exercise.id);
  }

  @ResolveField('difficulty')
  async getExerciseDifficulty(@Parent() exercise: Exercise) {
    return this.exerciseService.getDifficultyByExercise(exercise.id);
  }

  @ResolveField('tags')
  async getExerciseTags(@Parent() exercise: Exercise) {
    //TODO: Move this to an exercise-tag service
    return this.exerciseService.getTagsByExerciseId(exercise.id);
  }
}
