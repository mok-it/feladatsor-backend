import { faker } from '@faker-js/faker';
import { PrismaClient, Prisma } from '@prisma/client';

export const seedExercises = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany();
  /*
  const exercises: Prisma.ExerciseCreateInput[] = Array.from({
    length: 30,
  }).map(() => ({
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    solution: faker.lorem.paragraph(),
    helpingQuestions: [faker.lorem.sentence(), faker.lorem.sentence()],
    source: faker.datatype.boolean() ? faker.internet.url() : null,
    similarExerciseId: null,
    createdById: faker.helpers.arrayElement(users).id,

  }));

  await prisma.exercise.createMany({
    data: exercises,
  });*/
};
