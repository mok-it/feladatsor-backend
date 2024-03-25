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
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { UseGuards } from '@nestjs/common';
import { ExerciseService } from '../exercise/exercise.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Query('users')
  async getUsers() {
    return this.userService.users();
  }

  @UseGuards(JwtAuthGuard)
  @Query('user')
  async getUserById(@Args('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Mutation('register')
  async register(@Args('data') data: UserRegisterInput) {
    return this.userService.register(data);
  }

  @Mutation('changePermissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
