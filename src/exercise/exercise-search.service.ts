import {Injectable} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {ExerciseSearchQuery} from '../graphql/graphqlTypes';
import {PrismaService} from "../prisma/PrismaService";

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
    const countPromise = this.prismaService.exercise.count({
      where,
    });
    const dataPromise = this.prismaService.exercise.findMany({
      skip: query.skip,
      take: query.take,
      where,
    });

    const [data, count] = await Promise.all([dataPromise, countPromise]);

    return {
      exercises: data,
      totalCount: count,
    };
  }
}
