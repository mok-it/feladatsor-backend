import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  Role,
  User,
  UserRegisterInput,
  UserStats,
  UserUpdateInput,
} from '../graphql/graphqlTypes';
import { UseGuards } from '@nestjs/common';
import { ExerciseService } from '../exercise/exercise.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { User as PrismaUser } from '@prisma/client';
import { StatService } from '../stat/stat.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
    private readonly statService: StatService,
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

  @Mutation('updateUser')
  async updateUser(
    @CurrentUser() user: PrismaUser,
    @Args('data') data: UserUpdateInput,
    @Args('id') id?: string,
  ) {
    const userId = id ?? user.id;
    return this.userService.updateUser(userId, data);
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

  @ResolveField('avatarUrl')
  async getUserAvatar(@Parent() user: PrismaUser) {
    return this.userService.getUserAvatar(user);
  }

  @ResolveField('stats')
  async getStats(@Parent() user: PrismaUser): Promise<UserStats> {
    return {
      totalExerciseCount: await this.statService.getTotalExerciseCount(user.id),
      checkedExerciseCount: await this.statService.getCheckedExerciseCount(
        user.id,
      ),
      contributionCalendar: await this.statService.getContributionCalendar(
        user.id,
      ),
    };
  }

  @ResolveField('comments')
  async getCommentsByUser(@Parent() user: PrismaUser) {
    return this.userService.getUserComments(user.id);
  }
}
