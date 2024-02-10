import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { User, UserRegisterInput } from '../graphql/graphqlTypes';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';
import { UseGuards } from '@nestjs/common';
import { ExerciseService } from '../exercise/exercise.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
  ) {}

  @UseGuards(JwtAuthGuard)
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

  @ResolveField('exercises')
  async getExercises(@Parent() user: User) {
    return this.exerciseService.getExercisesByUserId(user.id);
  }
}
