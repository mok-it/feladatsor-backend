import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export const seedExerciseHistory = async (prisma: PrismaClient) => {
  const exercises = await prisma.exercise.findMany();
  const user = await prisma.user.findFirst({});

  await Promise.all(
    exercises.flatMap(async (exercise) =>
      Array.from({ length: 5 }).flatMap(() =>
        prisma.exerciseHistory.create({
          data: {
            exercise: { connect: { id: exercise.id } },
            field: faker.database.column(),
            user: { connect: { id: user.id } },
            newValue: faker.lorem.slug(10),
            oldValue: faker.lorem.slug(10),
          },
        }),
      ),
    ),
  );
};
