import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseComposeService } from './exercise-compose.service';
import {
  ExerciseSheetInput,
  UpdateExerciseSheetInput,
} from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import {
  User,
  ExerciseSheet as PrismaExerciseSheet,
  ExerciseSheetItem,
  TalonItem,
} from '@prisma/client';
import { UserService } from '../user/user.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { hasRolesOrAdmin } from '../auth/hasRolesOrAdmin';

@Resolver('ExerciseSheet')
export class ExerciseComposeResolver {
  constructor(
    private readonly exerciseComposeService: ExerciseComposeService,
    private readonly userService: UserService,
  ) {}

  @Query('exerciseSheets')
  @UseGuards(RolesGuard)
  @Roles('EXERCISE_SHEET')
  exerciseSheets() {
    return this.exerciseComposeService.getExerciseSheets();
  }

  @Query('exerciseSheet')
  @UseGuards(RolesGuard)
  @Roles('EXERCISE_SHEET')
  getExerciseSheet(@Args('id') id: string) {
    return this.exerciseComposeService.getExerciseSheetById(id);
  }

  @ResolveField('createdBy')
  resolveCreatedBy(@Parent() parent: PrismaExerciseSheet) {
    return this.userService.getUserById(parent.createdById);
  }

  @ResolveField('talonItems')
  resolveTalonItems(
    @Parent()
    parent: PrismaExerciseSheet & {
      sheetItems: ExerciseSheetItem[];
      talonExercises: TalonItem[];
    },
  ) {
    return parent.talonExercises;
  }

  @Mutation('createExerciseSheet')
  @UseGuards(RolesGuard)
  @Roles('EXERCISE_SHEET')
  createExerciseSheet(
    @Args('sheetData') sheetData: ExerciseSheetInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseComposeService.createExerciseSheet(sheetData, user);
  }

  @Mutation('updateExerciseSheet')
  @UseGuards(RolesGuard)
  @Roles('EXERCISE_SHEET')
  updateExerciseSheet(
    @Args('sheetData') sheetData: UpdateExerciseSheetInput,
    @Args('id') id: string,
    @CurrentUser() user: User,
  ) {
    const ableToFinalize = hasRolesOrAdmin(user, 'PROOFREAD_EXERCISE_SHEET');
    if (
      !ableToFinalize &&
      (sheetData.status == 'APPROVED' || sheetData.status == 'DELETED')
    ) {
      throw new UnauthorizedException(
        "You don't have permission to perform this action",
      );
    }
    return this.exerciseComposeService.updateExerciseSheet(id, sheetData);
  }

  @Mutation('deleteExerciseSheet')
  @UseGuards(RolesGuard)
  @Roles('PROOFREAD_EXERCISE_SHEET')
  deleteExerciseSheet(@Args('id') id: string) {
    return this.exerciseComposeService.deleteExerciseSheet(id);
  }
}
