import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ExerciseSearchQuery } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseSearchService {
  constructor(private readonly prismaClient: PrismaClient) {}

  async searchExercises(query: ExerciseSearchQuery) {
    const where: Prisma.ExerciseWhereInput = {
      description: {
        mode: 'insensitive',
        contains: query.queryStr,
      },
      AND: (query.difficulty ?? []).map((d) => ({
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
    };
    const countPromise = this.prismaClient.exercise.count({
      where,
    });
    const dataPromise = this.prismaClient.exercise.findMany({
      skip: query.fromRow,
      take: query.toRow - query.fromRow,
      where,
    });

    const [data, count] = await Promise.all([dataPromise, countPromise]);

    return {
      exercises: data,
      totalCount: count,
    };
  }
}
