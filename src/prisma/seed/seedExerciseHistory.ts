import { PrismaClient } from '@prisma/client';

export const seedExerciseHistory = async (prisma: PrismaClient) => {
  const exercises = await prisma.exercise.findMany();

  await Promise.all(
    exercises.map(async (exercise) => {
      await prisma.exerciseHistory.create({
        data: {
          exercise: { connect: { id: exercise.id } },
        },
      });
    }),
  );
};
