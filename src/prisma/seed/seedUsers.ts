import { PrismaClient } from '@prisma/client';
import { UserService } from '../../user/user.service';
import { faker } from '@faker-js/faker';

export const seedUsers = async (prisma: PrismaClient) => {
  const userService = new UserService(prisma);
  await userService.register({
    email: 'test@test.com',
    password: 'test',
    userName: 'test',
    name: 'Test User',
  });
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
