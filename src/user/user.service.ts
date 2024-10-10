import { Injectable, Logger } from '@nestjs/common';
import { Role, UserRegisterInput } from '../graphql/graphqlTypes';
import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly logger: Logger,
  ) {}

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

  /**
   * Intended to use only under development
   */
  getFirstUser() {
    return this.prismaClient.user.findFirst({
      where: {
        password: {
          not: null,
        },
      },
    });
  }

  async register(data: UserRegisterInput) {
    const hashedPassword = await hash(data.password, 10);
    try {
      return await this.prismaClient.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          userName: data.userName,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          this.logger.error(
            `There is a unique constraint violation, a new user cannot be created with username: ${data.userName}`,
          );
          return new Error('This username already exists');
        }
      }
      throw e;
    }
  }

  async getUserByUserName(userName: string) {
    return this.prismaClient.user.findUnique({
      where: {
        userName,
      },
    });
  }

  async upsertUserByGoogleId(
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

  async changePermissions(userId: string, roles: Role[]) {
    await this.prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: {
          set: roles,
        },
      },
    });

    return this.prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
