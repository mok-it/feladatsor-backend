import { Injectable, Logger } from '@nestjs/common';
import {
  Role,
  UserRegisterInput,
  UserUpdateInput,
} from '../graphql/graphqlTypes';
import { Prisma, User } from '@prisma/client';
import { hash } from 'bcrypt';
import { ImageService } from '../image/image.service';
import { Config } from '../config/config';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
    private readonly imageService: ImageService,
    private readonly config: Config,
  ) {}

  async users() {
    return this.prismaService.user.findMany();
  }

  async getUserById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getUserAvatar(user: User) {
    return user.customAvatarId
      ? this.imageService.resolveGQLImage(user.customAvatarId).url
      : user.avatarUrl;
  }

  /**
   * Intended to use only under development
   */
  async upsertTechnicalUser(): Promise<User> {
    const technicalUser = await this.prismaService.user.findFirst({
      where: {
        userName: this.config.technicalUser.username,
      },
    });
    if (technicalUser) return technicalUser;
    return await this.register({
      email: this.config.technicalUser.email,
      password: this.config.technicalUser.defaultPassword,
      name: this.config.technicalUser.name,
      userName: this.config.technicalUser.username,
    });
  }

  async upsertTechnicalUsers(): Promise<[User, User, User]> {
    const technicalUser = this.upsertTechnicalUser();

    let technicalUser2 = await this.prismaService.user.findFirst({
      where: {
        userName: this.config.technicalUser2.username,
      },
    });
    if (!technicalUser2) {
      technicalUser2 = await this.register({
        email: this.config.technicalUser2.email,
        password: this.config.technicalUser2.defaultPassword,
        name: this.config.technicalUser2.name,
        userName: this.config.technicalUser2.username,
      });
    }

    let technicalUser3 = await this.prismaService.user.findFirst({
      where: {
        userName: this.config.technicalUser3.username,
      },
    });
    if (!technicalUser3) {
      technicalUser3 = await this.register({
        email: this.config.technicalUser3.email,
        password: this.config.technicalUser3.defaultPassword,
        name: this.config.technicalUser3.name,
        userName: this.config.technicalUser3.username,
      });
    }

    return Promise.all([technicalUser, technicalUser2, technicalUser3]);
  }

  async register(data: UserRegisterInput) {
    const hashedPassword = await hash(data.password, 10);
    try {
      return await this.prismaService.user.create({
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

  async updateUser(userId: string, data: UserUpdateInput) {
    let hashedPassword: string;
    if (data.password) {
      hashedPassword = await hash(data.password, 10);
    }
    try {
      return await this.prismaService.user.update({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          userName: data.userName,
          customAvatarId: data.customAvatarId,
        },
        where: {
          id: userId,
        },
      });
    } catch (e) {
      throw e;
    }
  }

  async getUserByUserName(userName: string) {
    return this.prismaService.user.findUnique({
      where: {
        userName,
      },
    });
  }

  async upsertUserByGoogleId(
    googleId: string,
    userInfo: Prisma.UserCreateInput,
  ) {
    const user = await this.prismaService.user.findFirst({
      where: {
        firebaseId: googleId,
      },
    });

    if (user) {
      return user;
    }

    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email: userInfo.email,
      },
    });

    if (existingUser) {
      return this.prismaService.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          firebaseId: googleId,
        },
      });
    }

    return this.prismaService.user.create({
      data: {
        ...userInfo,
        firebaseId: googleId,
      },
    });
  }

  async changePermissions(userId: string, roles: Role[]) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: {
          set: roles,
        },
      },
    });

    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  getUserComments(id: string, skip = 0, take = 20) {
    return this.prismaService.exerciseComment.findMany({
      where: {
        OR: [
          {
            userId: id,
          },
          {
            contributors: {
              some: {
                id: id,
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  getUserByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
  }
}
