import { Injectable } from '@nestjs/common';
import { AuthenticateUser } from './authenticate-user-use-case';

@Injectable()
export class AuthService {
  constructor(private readonly authUser: AuthenticateUser) {}

  login(name: string, password: string) {
    return this.authUser.execute(name, password);
  }

  loginWithGoogle(token: string) {
    return this.authUser.loginWithGoogle(token);
  }
}
