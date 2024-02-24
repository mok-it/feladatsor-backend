import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('login')
  login(@Args('name') name: string, @Args('password') password: string) {
    return this.authService.login(name, password);
  }

  @Mutation('loginWithGoogle')
  loginWithGoogle(@Args('googleToken') googleToken: string) {
    return this.authService.loginWithGoogle(googleToken);
  }
}
