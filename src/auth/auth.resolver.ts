import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation('login')
  login(@Args('name') name: string, @Args('password') password: string) {
    return this.authService.login(name, password);
  }

  @Public()
  @Mutation('loginWithGoogle')
  loginWithGoogle(@Args('googleToken') googleToken: string) {
    return this.authService.loginWithGoogle(googleToken);
  }
}
