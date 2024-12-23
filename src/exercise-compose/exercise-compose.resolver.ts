import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseComposeService } from './exercise-compose.service';
import { ExerciseSheetInput } from '../graphql/graphqlTypes';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { User, ExerciseSheet as PrismaExerciseSheet } from '@prisma/client';
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

  @Mutation('createExerciseSheet')
  createExerciseSheet(
    @Args('sheetData') sheetData: ExerciseSheetInput,
    @CurrentUser() user: User,
  ) {
    return this.exerciseComposeService.createExerciseSheet(sheetData, user);
  }
}
