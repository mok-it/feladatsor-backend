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
import {
  ExerciseInput,
  ExerciseSearchQuery,
  ExerciseUpdateInput,
} from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { Exercise as PrismaExercise, User } from '@prisma/client';
import { ExerciseCheckService } from '../exercise-check/exercise-check.service';
import { ExerciseSearchService } from './exercise-search.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExerciseTagService } from '../exercise-tag/exercise-tag.service';
import { ImageService } from '../image/image.service';
import { UserService } from '../user/user.service';
import { ExerciseHistoryService } from '../exercise-history/exercise-history.service';
import { ExerciseCommentService } from '../exercise-comment/exercise-comment.service';

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseTagService: ExerciseTagService,
    private readonly exerciseSearchService: ExerciseSearchService,
    private readonly exerciseCheckService: ExerciseCheckService,
    private readonly imageService: ImageService,
    private readonly exerciseCommentService: ExerciseCommentService,
    private readonly userService: UserService,
    private readonly exerciseHistoryService: ExerciseHistoryService,
  ) {}

  @Query('exercise')
  async getExercise(@Args('id') id: string) {
    return this.exerciseService.getExerciseById(id);
  }

  @Query('exercises')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getExercises(@Args('take') take: number, @Args('skip') skip: number) {
    return this.exerciseService.getExercises(take, skip);
  }

  @Query('exercisesCount')
  async getExercisesCount() {
    return this.exerciseService.getExercisesCount();
  }

  @Query('searchExercises')
  async searchExercises(@Args('query') query: ExerciseSearchQuery) {
    return this.exerciseSearchService.searchExercises(query);
  }

  @Mutation('createExercise')
  async createExercise(
    @Args('input') data: ExerciseInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseService.createExercise(data, user);
  }

  @Mutation('updateExercise')
  async updateExercise(
    @Args('id') id: string,
    @Args('input') data: ExerciseUpdateInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseService.updateExercise(id, data, user);
  }

  @ResolveField('sameLogicExercises')
  async getSameDifficultyExercises(@Parent() exercise: PrismaExercise) {
    return this.exerciseService.getSameLogicExercises(exercise.id);
  }

  @ResolveField('history')
  async getHistory(@Parent() exercise: PrismaExercise) {
    return this.exerciseHistoryService.getHistoryByExerciseId(exercise.id);
  }

  @ResolveField('checks')
  async getChecks(@Parent() exercise: PrismaExercise) {
    return this.exerciseCheckService.getChecksByExerciseId(exercise.id);
  }

  @ResolveField('difficulty')
  async getExerciseDifficulty(@Parent() exercise: PrismaExercise) {
    return this.exerciseService.getDifficultyByExercise(exercise.id);
  }

  @ResolveField('tags')
  async getExerciseTags(@Parent() exercise: PrismaExercise) {
    return this.exerciseTagService.getTagsByExerciseId(exercise.id);
  }

  @ResolveField('exerciseImage')
  async getExerciseImage(@Parent() exercise: PrismaExercise) {
    //This is a string id, as we resolve this from prisma as a string
    return this.imageService.resolveGQLImage(exercise.exerciseImageId);
  }

  @ResolveField('solveIdeaImage')
  async getSolveIdeaImage(@Parent() exercise: PrismaExercise) {
    //This is a string id, as we resolve this from prisma as a string
    return this.imageService.resolveGQLImage(exercise.solveIdeaImageId);
  }

  @ResolveField('solutionImage')
  async getSolutionImage(@Parent() exercise: PrismaExercise) {
    //This is a string id, as we resolve this from prisma as a string
    return this.imageService.resolveGQLImage(exercise.solutionImageId);
  }

  @ResolveField('comments')
  async getExerciseComments(@Parent() exercise: PrismaExercise) {
    return this.exerciseCommentService.getCommentsByExerciseId(exercise.id);
  }

  @ResolveField('createdBy')
  async getExerciseCreatedBy(@Parent() exercise: PrismaExercise) {
    return this.userService.getUserById(exercise.createdById);
  }
}
