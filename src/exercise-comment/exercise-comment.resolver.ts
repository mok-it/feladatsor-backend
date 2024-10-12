import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ExerciseCommentService } from './exercise-comment.service';
import { CurrentUser } from 'src/auth/decorators/user.auth.decorator';
import { User } from '@prisma/client';

@Resolver('ExerciseComment')
export class ExerciseCommentResolver {
  constructor(
    private readonly exerciseCommentService: ExerciseCommentService,
  ) {}

  @Query('exerciseComment')
  async getExerciseCommentById(@Args('id') id: string) {
    return this.exerciseCommentService.getExerciseCommentById(id);
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
}
