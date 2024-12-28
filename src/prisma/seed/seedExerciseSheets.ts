import { PrismaService } from '../PrismaService';
import { ExerciseAgeGroup } from '../../graphql/graphqlTypes';
import { faker } from '@faker-js/faker';

export async function seedExerciseSheets(prisma: PrismaService) {
  const exerciseIds = (
    await prisma.exercise.findMany({ select: { id: true } })
  ).map((exercise) => exercise.id);

  const users = await prisma.user.findMany();

  await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.$transaction(async (tx) => {
        const levels = [0, 1, 2, 3];
        const ageGroups = [
          ExerciseAgeGroup.KISMEDVE,
          ExerciseAgeGroup.KOALA,
          ExerciseAgeGroup.JEGESMEDVE,
          ExerciseAgeGroup.MEDVEBOCS,
          ExerciseAgeGroup.NAGYMEDVE,
        ];

        const sheetItems = await Promise.all(
          levels.flatMap((level) =>
            ageGroups.flatMap((ageGroup) =>
              tx.exerciseSheetItem.create({
                data: {
                  exercises: {
                    connect: faker.helpers
                      .arrayElements(exerciseIds, { min: 0, max: 3 })
                      .map((id) => ({ id })),
                  },
                  ageGroup,
                  level,
                },
              }),
            ),
          ),
        );

        return tx.exerciseSheet.create({
          data: {
            name: faker.lorem.sentence(),
            sheetItems: sheetItems
              ? {
                  connect: sheetItems.map((item) => ({ id: item.id })),
                }
              : undefined,
            createdBy: {
              connect: {
                id: faker.helpers.arrayElement(users).id,
              },
            },
          },
          include: { sheetItems: true },
        });
      }),
    ),
  );
}
