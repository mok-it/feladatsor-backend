import { Injectable } from '@nestjs/common';
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

  createToken(user: User) {
    const payload: Omit<Omit<JwtPayload, 'iat'>, 'exp'> = {
      subject: user.id,
      user_name: user.userName,
      roles: user.roles,
    };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async execute(name: string, password: string) {
    const user = await this.userService.getUserByUserName(name);
    if (!user || !user.password) {
      return null;
    }
    const passwordHasMatch = await compare(password, user.password);
    if (!passwordHasMatch) {
      return null;
    }
    return this.createToken(user);
  }

  async loginWithGoogle(token: string) {
    //Check if token is valid
    const isValid = await validateFirebaseToken(token);
    if (!isValid) {
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
