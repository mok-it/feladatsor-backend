import {UserService} from '../../user/user.service';
import {faker} from '@faker-js/faker';
import {INestApplication} from '@nestjs/common';
import {Role} from '../../graphql/graphqlTypes';

export const seedUsers = async (app: INestApplication) => {
  const userService = app.get(UserService);

  const user = await userService.register({
    email: 'test@test.com',
    password: 'test',
    userName: 'test',
    name: 'Test User',
  });

  await userService.changePermissions(user.id, [Role.ADMIN, Role.USER]);

  await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
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
