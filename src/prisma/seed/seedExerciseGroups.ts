import { faker } from '@faker-js/faker';
import { PrismaService } from '../PrismaService';

export async function seedExerciseGroups(prisma: PrismaService) {
  const users = await prisma.user.findMany();

  await prisma.exerciseGroupSameLogic.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      description: faker.lorem.sentence(),
      createdAt: faker.date.past({ years: 3 }),
      createdById: faker.helpers.arrayElement(users).id,
    })),
  });
}
