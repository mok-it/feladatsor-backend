import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserRegisterInput } from '../graphql/graphqlTypes';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';
import { UseGuards } from '@nestjs/common';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
}
