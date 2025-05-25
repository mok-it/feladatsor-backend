import { Injectable, Logger } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwtPayload';
import { validateFirebaseToken } from './validateFirebaseToken';
import { User } from '@prisma/client';

@Injectable()
export class AuthenticateUser {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private logger = new Logger(AuthenticateUser.name);

  createToken(user: User) {
    const payload: Omit<Omit<JwtPayload, 'iat'>, 'exp'> = {
      subject: user.id,
      user_name: user.userName,
      roles: user.roles,
    };
    this.logger.debug('JWT token created', payload);
    this.logger.log(`User logged in: ${user.userName}`);
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async login(name: string, password: string) {
    const user = await this.userService.getUserByUserName(name);
    if (!user || !user.password) {
      this.logger.log(
        `Failed login for user: [${user.userName}] Id: ${user.id}`,
      );
      return null;
    }
    const passwordHasMatch = await compare(password, user.password);
    if (!passwordHasMatch) {
      this.logger.log(
        `Failed login for user, pass mismatch: [${user.userName}] Id: ${user.id}`,
      );
      return null;
    }
    return this.createToken(user);
  }

  async loginWithGoogle(token: string) {
    //Check if token is valid
    const isValid = await validateFirebaseToken(token);
    if (!isValid) {
      this.logger.debug(`Firebase token is invalid for token: ${token}`);
      return null;
    }

    const payload = this.jwtService.decode(token, {
      json: true,
    }) as GoogleTokenPayload;

    const user = await this.userService.upsertUserByGoogleId(payload.user_id, {
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture,
      userName: payload.email,
      firebaseId: payload.user_id,
    });

    return this.createToken(user);
  }
}

type GoogleTokenPayload = {
  name: string;
  picture: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: {
    identities: {
      'google.com': string[];
      email: string[];
    };
    sign_in_provider: string | 'google.com';
  };
};
