import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseCommentService } from './exercise-comment.service';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { ExerciseComment, User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver('ExerciseComment')
export class ExerciseCommentResolver {
  constructor(
    private readonly exerciseCommentService: ExerciseCommentService,
    private readonly userService: UserService,
  ) {}

  @Query('exerciseComment')
  async getExerciseCommentById(@Args('id') id: string) {
    return this.exerciseCommentService.getExerciseCommentById(id);
  }

  @Query('commentsByExercise')
  async getCommentsByExercise(@Args('id') exerciseId: string) {
    return this.exerciseCommentService.getCommentsByExerciseId(exerciseId);
  }

  @Mutation('createExerciseComment')
  @UseGuards(RolesGuard)
  @Roles('USER')
  async createExerciseComment(
    @Args('exerciseId') exerciseId: string,
    @Args('comment') comment: string,
    @CurrentUser() user: User,
    @Args('contributors') contributors?: string[],
  ) {
    return this.exerciseCommentService.createExerciseComment(
      exerciseId,
      comment,
      user,
      contributors,
    );
  }

  @Mutation('updateExerciseComment')
  @UseGuards(RolesGuard)
  @Roles('USER')
  async updateExerciseComment(
    @Args('id') id: string,
    @Args('comment') comment: string,
    @Args('contributors') contributors?: string[],
  ) {
    return this.exerciseCommentService.updateExerciseComment(
      id,
      comment,
      contributors,
    );
  }

  @Mutation('deleteExerciseComment')
  @UseGuards(RolesGuard)
  @Roles('USER')
  async deleteExerciseComment(@Args('id') id: string) {
    return this.exerciseCommentService.deleteExerciseComment(id);
  }

  @ResolveField('createdBy')
  async commentCreatedBy(@Parent() comment: ExerciseComment) {
    return this.userService.getUserById(comment.userId);
  }
}
