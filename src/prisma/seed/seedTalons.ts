import { PrismaService } from '../PrismaService';
import { faker } from '@faker-js/faker';

export async function seedTalons(prisma: PrismaService) {
  const sheets = await prisma.exerciseSheet.findMany();
  const exercises = await prisma.exercise.findMany();

  await Promise.all(
    sheets.map((sheet) =>
      prisma.exerciseSheet.update({
        where: {
          id: sheet.id,
        },
        data: {
          talonExercises: {
            create: faker.helpers
              .arrayElements(exercises, { min: 5, max: 20 })
              .map((exercise, index) => ({
                exerciseId: exercise.id,
                order: index,
              })),
          },
        },
      }),
    ),
  );
}
