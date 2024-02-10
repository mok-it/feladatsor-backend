import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwtPayload';

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
}
