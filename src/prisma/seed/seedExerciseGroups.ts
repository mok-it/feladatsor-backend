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

  const groups = await prisma.exerciseGroupSameLogic.findMany({});
  const exercises = await prisma.exercise.findMany({ select: { id: true } });

  await Promise.all(
    groups.flatMap((group) =>
      faker.helpers
        .arrayElements(exercises, { min: 2, max: 5 })
        .flatMap((exercise) =>
          prisma.exercise.update({
            where: {
              id: exercise.id,
            },
            data: {
              sameLogicExerciseGroup: {
                connect: {
                  id: group.id,
                },
              },
            },
          }),
        ),
    ),
  );
}
