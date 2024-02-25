import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ExerciseSearchQuery } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseSearchService {
  constructor(private readonly prismaClient: PrismaClient) {}

  searchExercises(query: ExerciseSearchQuery) {
    return this.prismaClient.exercise.findMany({
      where: {
        description: {
          contains: query.queryStr,
        },
        OR: (query.difficulty ?? []).map((d) => ({
          difficulty: {
            some: {
              difficulty: {
                lte: d.max,
                gte: d.min,
              },
              ageGroup: d.ageGroup,
            },
          },
        })),
        /*tags: {
          some: {
            name: {
              in: query.tags ?? [],
            },
          },
          none: {
            name: {
              in: query.excludeTags ?? [],
            },
          },
        },*/
      },
    });
  }
}
