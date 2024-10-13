import { PrismaClient } from '@prisma/client';
import { UserService } from '../../user/user.service';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Role } from '../../graphql/graphqlTypes';
import { ImageService } from '../../image/image.service';
import { Config } from '../../config/config';

export const seedUsers = async (prisma: PrismaClient) => {
  const logger = new Logger('SeedUsers');
  const config = new Config();
  const imageService = new ImageService(prisma, config);
  const userService = new UserService(prisma, logger, imageService);
  const user = await userService.register({
    email: 'test@test.com',
    password: 'test',
    userName: 'test',
    name: 'Test User',
  });

  await userService.changePermissions(user.id, [Role.ADMIN]);

  await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return await userService.register({
        email: faker.internet.email({ firstName, lastName }),
        password: 'test',
        userName: faker.internet.userName({ firstName, lastName }) + i,
        name: `${firstName} ${lastName}`,
      });
    }),
  );
};
