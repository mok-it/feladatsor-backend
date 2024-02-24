import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwtPayload';
import { validateFirebaseToken } from './validateFirebaseToken';

@Injectable()
export class AuthenticateUser {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async execute(name: string, password: string) {
    const user = await this.userService.getUserByUserName(name);
    if (!user) {
      return null;
    }
    const passwordHasMatch = await compare(password, user.password);
    if (!passwordHasMatch) {
      return null;
    }
    const payload: Omit<Omit<JwtPayload, 'iat'>, 'exp'> = {
      subject: user.id,
      user_name: user.userName,
    };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }

  async loginWithGoogle(token: string) {
    //Check if token is valid
    const isValid = validateFirebaseToken(token);
    if (!isValid) {
      return null;
    }

    const payload = this.jwtService.decode(token, {
      json: true,
    }) as GoogleTokenPayload;

    return await this.userService.upserUserByGoogleId('googleId', {
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture,
      userName: payload.email,
      firebaseId: payload.user_id,
    });
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
