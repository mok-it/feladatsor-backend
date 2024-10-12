import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { Role, User, UserRegisterInput } from '../graphql/graphqlTypes';
import { UseGuards } from '@nestjs/common';
import { ExerciseService } from '../exercise/exercise.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Query('users')
  async getUsers() {
    return this.userService.users();
  }

  @Query('user')
  async getUserById(@Args('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Public()
  @Mutation('register')
  async register(@Args('data') data: UserRegisterInput) {
    return this.userService.register(data);
  }

  @Mutation('changePermissions')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async changePermissions(
    @Args('userId') userId: string,
    @Args('permissions') roles: Role[],
  ) {
    return this.userService.changePermissions(userId, roles);
  }

  @ResolveField('exercises')
  async getExercises(@Parent() user: User) {
    return this.exerciseService.getExercisesByUserId(user.id);
  }
}
