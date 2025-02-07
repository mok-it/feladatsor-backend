import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { ExerciseCheckService } from '../../exercise-check/exercise-check.service';
import { ExerciseCheckType } from '../../graphql/graphqlTypes';

export const seedExerciseChecks = async (
  prisma: PrismaClient,
  app: INestApplication,
) => {
  const users = await prisma.user.findMany();
  const exercises = await prisma.exercise.findMany();

  const exerciseCheckService = await app.get(ExerciseCheckService);

  await Promise.all(
    exercises
      .filter(() => Math.random() > 0.5)
      .map(async (exercise) => {
        const usedUsers: string[] = [];
        await Promise.all(
          Array.from({
            length: faker.helpers.rangeToNumber({ min: 0, max: 5 }),
          }).map(async () => {
            const randomUser = faker.helpers.arrayElement(
              users.filter((u) => !usedUsers.includes(u.id)),
            );
            usedUsers.push(randomUser.id);
            await prisma.exerciseCheck.create({
              data: {
                exercise: { connect: { id: exercise.id } },
                user: { connect: { id: randomUser.id } },
                type: faker.helpers.weightedArrayElement([
                  {
                    weight: 10,
                    value: ExerciseCheckType.GOOD,
                  },
                  {
                    weight: 1,
                    value: ExerciseCheckType.CHANGE_REQUIRED,
                  },
                  {
                    weight: 1,
                    value: ExerciseCheckType.TO_DELETE,
                  },
                ]),
                contributors: {
                  connect: faker.helpers
                    .arrayElements(users, {
                      min: 0,
                      max: 2,
                    })
                    .map((u) => ({
                      id: u.id,
                    })),
                },
              },
            });
          }),
        );

        return await exerciseCheckService.doExerciseCheckAggregation(
          exercise.id,
        );
      }),
  );
};
