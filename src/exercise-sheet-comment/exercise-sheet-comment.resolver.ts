import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ExerciseSheetCommentService } from './exercise-sheet-comment.service';
import { CreateExerciseSheetCommentInput } from '../graphql/graphqlTypes';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { User, ExerciseSheetComment } from '@prisma/client';
import { UserService } from '../user/user.service';

@Resolver('ExerciseSheetComment')
export class ExerciseSheetCommentResolver {
  constructor(
    private readonly exerciseSheetCommentService: ExerciseSheetCommentService,
    private readonly userService: UserService,
  ) {}

  @Mutation('createExerciseSheetComment')
  @UseGuards(RolesGuard)
  @Roles('PROOFREAD_EXERCISE_SHEET')
  create(
    @Args('input') input: CreateExerciseSheetCommentInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseSheetCommentService.create(input, user);
  }

  @Mutation('resolveExerciseSheetComment')
  @UseGuards(RolesGuard)
  @Roles('PROOFREAD_EXERCISE_SHEET')
  resolve(
    @Args('id') id: string,
    @Args('notes') notes: string,
    @CurrentUser() user: User,
  ) {
    return this.exerciseSheetCommentService.resolve(id, notes, user);
  }

  @Mutation('deleteExerciseSheetComment')
  @UseGuards(RolesGuard)
  @Roles('PROOFREAD_EXERCISE_SHEET')
  delete(@Args('id') id: string) {
    return this.exerciseSheetCommentService.delete(id);
  }

  @Query('exerciseSheetComments')
  @UseGuards(RolesGuard)
  @Roles('PROOFREAD_EXERCISE_SHEET', 'EXERCISE_SHEET')
  findAll(@Args('sheetId') sheetId: string) {
    return this.exerciseSheetCommentService.getCommentsBySheetId(sheetId);
  }

  @ResolveField('user')
  async user(@Parent() comment: ExerciseSheetComment) {
    return this.userService.getUserById(comment.userId);
  }

  @ResolveField('resolvedBy')
  async resolvedBy(@Parent() comment: ExerciseSheetComment) {
    if (!comment.resolvedById) return null;
    return this.userService.getUserById(comment.resolvedById);
  }
}

@Resolver('ExerciseSheet')
export class ExerciseSheetExtensionResolver {
  constructor(
    private readonly exerciseSheetCommentService: ExerciseSheetCommentService,
  ) {}

  @ResolveField('comments')
  comments(@Parent() sheet: any) {
    return this.exerciseSheetCommentService.getCommentsForSheet(sheet.id);
  }
}

@Resolver('ExerciseSheetItem')
export class ExerciseSheetItemExtensionResolver {
  constructor(
    private readonly exerciseSheetCommentService: ExerciseSheetCommentService,
  ) {}

  @ResolveField('comments')
  comments(@Parent() item: any) {
    return this.exerciseSheetCommentService.getCommentsForSheetItem(item.id);
  }
}

@Resolver('OrderedExercise')
export class OrderedExerciseExtensionResolver {
  constructor(
    private readonly exerciseSheetCommentService: ExerciseSheetCommentService,
  ) {}

  @ResolveField('comments')
  comments(@Parent() orderedExercise: any) {
    if (!orderedExercise.id) return [];
    return this.exerciseSheetCommentService.getCommentsForExerciseOnSheet(
      orderedExercise.id,
    );
  }
}
