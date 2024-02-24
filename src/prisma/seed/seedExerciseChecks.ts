import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const seedExerciseChecks = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany();
  const exercises = await prisma.exercise.findMany();

  await Promise.all(
    exercises.map(async (exercise) => {
      const randomUser = faker.helpers.arrayElement(users);
      await prisma.exerciseCheck.create({
        data: {
          exercise: { connect: { id: exercise.id } },
          user: { connect: { id: randomUser.id } },
          type: faker.helpers.arrayElement([
            'GOOD',
            'CHANGE_REQUIRED',
            'TO_DELETE',
          ]),
        },
      });
    }),
  );
};
