import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseService } from './exercise.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  AlertSeverity,
  ExerciseAlert,
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
import { ExerciseGroupService } from '../exercise-group/exercise-group.service';
import { hasRolesOrAdmin } from '../auth/hasRolesOrAdmin';

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly exerciseTagService: ExerciseTagService,
    private readonly exerciseSearchService: ExerciseSearchService,
    private readonly exerciseCheckService: ExerciseCheckService,
    private readonly exerciseGroupService: ExerciseGroupService,
    private readonly imageService: ImageService,
    private readonly exerciseCommentService: ExerciseCommentService,
    private readonly userService: UserService,
    private readonly exerciseHistoryService: ExerciseHistoryService,
  ) {}

  @Query('exercise')
  @UseGuards(RolesGuard)
  async getExercise(@Args('id') id: string, @CurrentUser() user: User) {
    const isUser = hasRolesOrAdmin(user, 'USER');
    const exercise = await this.exerciseService.getExerciseById(id);
    if (
      !isUser &&
      user.id !== exercise.createdById &&
      !exercise.contributors.some((c) => c.id == user.id)
    ) {
      return new UnauthorizedException("Can't access this resource");
    }
    return exercise;
  }

  @Query('exercises')
  @UseGuards(RolesGuard)
  @Roles('LIST_EXERCISES')
  async getExercises(
    @Args('take') take: number,
    @Args('skip') skip: number,
    @Args('createdAtFrom') createdAtFrom?: string,
    @Args('createdAtTo') createdAtTo?: string,
  ) {
    console.log('take, skip, createdAtFrom, createdAtTo', {
      take,
      skip,
      createdAtFrom,
      createdAtTo,
    });
    return this.exerciseService.getExercises(
      take,
      skip,
      createdAtFrom,
      createdAtTo,
    );
  }

  @Query('exercisesCount')
  @UseGuards(RolesGuard)
  @Roles('LIST_EXERCISES')
  async getExercisesCount() {
    return this.exerciseService.getExercisesCount();
  }

  @Query('searchExercises')
  @UseGuards(RolesGuard)
  async searchExercises(
    @Args('query') query: ExerciseSearchQuery,
    @CurrentUser() currentUser: User,
  ) {
    //If the user doesn't have the user role -> Only able to search for exercises created by him.
    const notUser = !hasRolesOrAdmin(currentUser, 'LIST_EXERCISES');
    return this.exerciseSearchService.searchExercises(
      query,
      notUser ? currentUser : undefined,
    );
  }

  @Mutation('createExercise')
  @UseGuards(RolesGuard)
  @Roles('USER')
  async createExercise(
    @Args('input') data: ExerciseInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseService.createExercise(data, user);
  }

  @Mutation('updateExercise')
  @UseGuards(RolesGuard)
  @Roles('USER')
  async updateExercise(
    @Args('id') id: string,
    @Args('input') data: ExerciseUpdateInput,
    @CurrentUser() user: User,
  ) {
    const ableToFinalize = hasRolesOrAdmin(user, 'FINALIZE_EXERCISE');
    if (
      !ableToFinalize &&
      (data.status == 'APPROVED' || data.status == 'DELETED')
    ) {
      throw new UnauthorizedException(
        "You don't have permission to perform this action",
      );
    }

    return this.exerciseService.updateExercise(id, data, user);
  }

  @Mutation('cloneExerciseToNew')
  @UseGuards(RolesGuard)
  @Roles('CLONE_EXERCISE')
  async cloneExerciseToNew(
    @Args('id') id: string,
    @Args('contributors') contributors: string[],
    @CurrentUser() user: User,
  ) {
    return this.exerciseService.cloneExerciseToNew(
      id,
      user,
      undefined,
      contributors,
    );
  }

  @ResolveField('sameLogicExerciseGroup')
  async getSameDifficultyExercises(@Parent() exercise: PrismaExercise) {
    return this.exerciseGroupService.getGroupById(
      exercise.exerciseGroupSameLogicId,
    );
  }

  @ResolveField('alert')
  getAlert(@Parent() exercise: PrismaExercise): ExerciseAlert {
    if (!exercise.alertSeverty || !exercise.alertDescription) return null;
    return {
      severity: exercise.alertSeverty as AlertSeverity,
      description: exercise.alertDescription,
    };
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

  @ResolveField('contributors')
  async getContributors(@Parent() exercise: PrismaExercise) {
    return this.exerciseService.getContributors(exercise.id);
  }
}
