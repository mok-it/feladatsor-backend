import { faker } from '@faker-js/faker';
import { AgeGroup, Prisma, PrismaClient } from '@prisma/client';

export const seedExercises = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany();

  const tags = await prisma.exerciseTag.findMany();
  const ageGroups: AgeGroup[] = [
    'KOALA',
    'MEDVEBOCS',
    'KISMEDVE',
    'NAGYMEDVE',
    'JEGESMEDVE',
  ];

  const exercises: Prisma.ExerciseCreateInput[] = Array.from({
    length: 30,
  }).map(() => ({
    description: faker.lorem.paragraph(),
    solution: faker.lorem.paragraph(),
    helpingQuestions: [faker.lorem.sentence(), faker.lorem.sentence()],
    source: faker.datatype.boolean() ? faker.internet.url() : null,
    createdBy: {
      connect: {
        id: faker.helpers.arrayElement(users).id,
      },
    },
    status: faker.helpers.arrayElement([
      'CREATED',
      'DELETED',
      'DRAFT',
      'APPROVED',
    ]),
    difficulty: {
      createMany: {
        data: ageGroups.map((ageGroup) => ({
          ageGroup,
          difficulty: faker.number.int({ min: 1, max: 4 }),
        })),
      },
    },
    tags: {
      connect: faker.helpers
        .arrayElements(tags, { min: 1, max: 5 })
        .map((tag) => ({
          id: tag.id,
        })),
    },
    isCompetitionFinal: faker.datatype.boolean(0.1),
  }));

  await Promise.all(
    exercises.map(async (ex) => {
      await prisma.exercise.create({
        data: ex,
      });
    }),
  );
};
