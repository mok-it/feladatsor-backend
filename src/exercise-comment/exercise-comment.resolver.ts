import {Args, Mutation, Parent, Query, ResolveField, Resolver,} from '@nestjs/graphql';
import {ExerciseCommentService} from './exercise-comment.service';
import {CurrentUser} from '../auth/decorators/user.auth.decorator';
import {ExerciseComment, User} from '@prisma/client';
import {UserService} from '../user/user.service';

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
  async createExerciseComment(
    @Args('exerciseId') exerciseId: string,
    @Args('comment') comment: string,
    @CurrentUser() user: User,
  ) {
    return this.exerciseCommentService.createExerciseComment(
      exerciseId,
      comment,
      user,
    );
  }

  @Mutation('updateExerciseComment')
  async updateExerciseComment(
    @Args('id') id: string,
    @Args('comment') comment: string,
  ) {
    return this.exerciseCommentService.updateExerciseComment(id, comment);
  }

  @Mutation('deleteExerciseComment')
  async deleteExerciseComment(@Args('id') id: string) {
    return this.exerciseCommentService.deleteExerciseComment(id);
  }

  @ResolveField('createdBy')
  async commentCreatedBy(@Parent() comment: ExerciseComment) {
    return this.userService.getUserById(comment.userId);
  }
}
