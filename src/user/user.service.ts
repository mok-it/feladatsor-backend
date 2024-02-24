import { Injectable } from '@nestjs/common';
import { UserRegisterInput } from '../graphql/graphqlTypes';
import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaClient: PrismaClient) {}

  async users() {
    return this.prismaClient.user.findMany();
  }

  getUserById(id: string) {
    return this.prismaClient.user.findUnique({
      where: {
        id,
      },
    });
  }

  async register(data: UserRegisterInput) {
    const hashedPassword = await hash(data.password, 10);
    return this.prismaClient.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        userName: data.userName,
      },
    });
  }

  async getUserByUserName(userName: string) {
    return this.prismaClient.user.findUnique({
      where: {
        userName,
      },
    });
  }

  async upserUserByGoogleId(
    googleId: string,
    userInfo: Prisma.UserCreateInput,
  ) {
    const user = await this.prismaClient.user.findFirst({
      where: {
        firebaseId: googleId,
      },
    });

    if (user) {
      return user;
    }

    const existingUser = await this.prismaClient.user.findFirst({
      where: {
        email: userInfo.email,
      },
    });

    if (existingUser) {
      return this.prismaClient.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          firebaseId: googleId,
        },
      });
    }

    return this.prismaClient.user.create({
      data: {
        ...userInfo,
        firebaseId: googleId,
      },
    });
  }
}
