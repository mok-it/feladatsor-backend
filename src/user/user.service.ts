import { Injectable, Logger } from '@nestjs/common';
import {
  Role,
  UserRegisterInput,
  UserUpdateInput,
} from '../graphql/graphqlTypes';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { hash } from 'bcrypt';
import { ImageService } from '../image/image.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly logger: Logger,
    private readonly imageService: ImageService,
  ) {}

  async users() {
    return this.prismaClient.user.findMany();
  }

  async getUserById(id: string) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id,
      },
    });
    user.avatarUrl = user.customAvatarId
      ? this.imageService.resolveGQLImage(user.customAvatarId).url
      : user.avatarUrl;
    return user;
  }

  /**
   * Intended to use only under development
   */
  getFirstUser(): Promise<User> {
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
          throw new Error('This username already exists');
        }
      }
      throw e;
    }
  }

  async updateUser(data: UserUpdateInput) {
    let hashedPassword: string;
    if (data.password) {
      hashedPassword = await hash(data.password, 10);
    }
    try {
      return await this.prismaClient.user.update({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          customAvatarId: data.customAvatarId,
        },
        where: {
          id: data.id,
        },
      });
    } catch (e) {
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
