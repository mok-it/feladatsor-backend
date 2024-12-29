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

@Resolver('ExerciseSheet')
export class ExerciseComposeResolver {
  constructor(
    private readonly exerciseComposeService: ExerciseComposeService,
    private readonly userService: UserService,
  ) {}

  @Query('exerciseSheets')
  exerciseSheets() {
    return this.exerciseComposeService.getExerciseSheets();
  }

  @Query('exerciseSheet')
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
  createExerciseSheet(
    @Args('sheetData') sheetData: ExerciseSheetInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseComposeService.createExerciseSheet(sheetData, user);
  }

  @Mutation('updateExerciseSheet')
  updateExerciseSheet(
    @Args('sheetData') sheetData: UpdateExerciseSheetInput,
    @Args('id') id: string,
  ) {
    return this.exerciseComposeService.updateExerciseSheet(id, sheetData);
  }

  @Mutation('deleteExerciseSheet')
  deleteExerciseSheet(@Args('id') id: string) {
    return this.exerciseComposeService.deleteExerciseSheet(id);
  }
}
