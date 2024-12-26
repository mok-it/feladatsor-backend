import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ExerciseSearchQuery } from '../graphql/graphqlTypes';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class ExerciseSearchService {
  constructor(private readonly prismaService: PrismaService) {}

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
      isCompetitionFinal:
        typeof query.isCompetitionFinal === 'boolean'
          ? {
              equals: query.isCompetitionFinal,
            }
          : undefined,
      tags: {
        some:
          query.tags && query.tags.length > 0
            ? {
                id: {
                  in: query.tags,
                },
              }
            : undefined,
        none: {
          id: {
            in: query.excludeTags ?? [],
          },
        },
      },
    };
    const countPromise = this.prismaService.exercise.count({
      where,
    });
    const dataPromise = this.prismaService.exercise.findMany({
      skip: query.skip,
      take: query.take,
      where,
      orderBy: query.orderBy
        ? {
            [query.orderBy]: query.orderDirection.toLowerCase() ?? 'desc',
          }
        : undefined,
    });

    const [data, count] = await Promise.all([dataPromise, countPromise]);

    return {
      exercises: data,
      totalCount: count,
    };
  }
}
