import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';
import { ExerciseService } from '../../exercise/exercise.service';
import {
  AlertSeverity,
  ExerciseAgeGroup,
  ExerciseStatus,
} from '../../graphql/graphqlTypes';

export const seedExercises = async (
  prisma: PrismaClient,
  app: INestApplication,
) => {
  const users = await prisma.user.findMany();

  const tags = await prisma.exerciseTag.findMany();
  const exerciseService = await app.get(ExerciseService);
  const ageGroups: ExerciseAgeGroup[] = [
    ExerciseAgeGroup.KOALA,
    ExerciseAgeGroup.MEDVEBOCS,
    ExerciseAgeGroup.KISMEDVE,
    ExerciseAgeGroup.NAGYMEDVE,
    ExerciseAgeGroup.JEGESMEDVE,
  ];

  const exercises = await Promise.all(
    ['23', '24'].flatMap((year) =>
      Array.from({
        length: faker.helpers.rangeToNumber({ min: 20, max: 100 }),
      }).map((_, id) => {
        const shouldAddAlert = faker.number.int(100) > 50;
        const createdByUser = faker.helpers.arrayElement(users);
        return exerciseService.createExercise(
          {
            description: faker.lorem.paragraph(),
            solution: faker.lorem.paragraph(),
            helpingQuestions: [faker.lorem.sentence(), faker.lorem.sentence()],
            source: faker.datatype.boolean() ? faker.internet.url() : null,
            status: faker.helpers.arrayElement([
              ExerciseStatus.APPROVED,
              ExerciseStatus.CREATED,
              ExerciseStatus.DELETED,
              ExerciseStatus.DRAFT,
            ]),
            alert: shouldAddAlert
              ? {
                  description: faker.lorem.sentence(),
                  severity: faker.helpers.arrayElement([
                    'SUCCESS',
                    'INFO',
                    'ERROR',
                    'WARNING',
                  ]) as AlertSeverity,
                }
              : undefined,
            difficulty: ageGroups.map((ageGroup) => ({
              ageGroup,
              difficulty: faker.number.int({ min: 1, max: 4 }),
            })),
            contributors: faker.helpers
              .arrayElements(users, {
                min: 0,
                max: 3,
              })
              .map((user) => user.id),
            tags: faker.helpers
              .arrayElements(tags, { min: 1, max: 5 })
              .map((tag) => tag.id),
            createdAt: faker.date.past({ years: 1, refDate: `20${year}` }),
            isCompetitionFinal: faker.datatype.boolean(0.1),
            solutionOptions: Array.from({
              length: faker.number.int({ min: 0, max: 4 }),
            }).map(() => faker.lorem.sentence()),
          },
          createdByUser,
          {
            id: `${year}-${String(id).padStart(3, '0')}-a`,
          },
        );
      }),
    ),
  );

  for (const a in Array.from({ length: 100 })) {
    const exercise = faker.helpers.arrayElement(exercises);
    for (const b in Array.from({
      length: faker.number.int({ min: 1, max: 3 }),
    })) {
      await exerciseService.cloneExerciseToNew(
        exercise.id,
        faker.helpers.arrayElement(users),
        faker.date.future({ years: 1, refDate: exercise.createdAt }),
      );
    }
  }
};
