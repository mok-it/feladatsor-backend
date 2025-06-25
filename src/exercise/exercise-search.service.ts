import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ExerciseSearchQuery } from '../graphql/graphqlTypes';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class ExerciseSearchService {
  constructor(private readonly prismaService: PrismaService) {}

  async searchExercises(query: ExerciseSearchQuery, workedOnThisUser?: User) {
    const where: Prisma.ExerciseWhereInput = {
      OR: [
        {
          description: {
            mode: 'insensitive',
            contains: query.queryStr,
          },
        },
        {
          id: {
            mode: 'insensitive',
            contains: query.queryStr,
          },
        },
      ],
      AND: [
        {
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
        },
        workedOnThisUser
          ? {
              OR: [
                {
                  createdBy: {
                    id: workedOnThisUser.id,
                  },
                  contributors: {
                    some: {
                      id: workedOnThisUser.id,
                    },
                  },
                },
              ],
            }
          : undefined,
      ],
      isCompetitionFinal:
        typeof query.isCompetitionFinal === 'boolean'
          ? {
              equals: query.isCompetitionFinal,
            }
          : undefined,
      tags: {
        some:
          query.includeTags && query.includeTags.length > 0
            ? {
                id: {
                  in: query.includeTags,
                },
              }
            : undefined,
        none: {
          id: {
            in: query.excludeTags ?? [],
          },
        },
      },
      aggregatedCheckStatus: query.exerciseCheck
        ? {
            equals: query.exerciseCheck,
          }
        : undefined,
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
