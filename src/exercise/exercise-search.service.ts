import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ExerciseCheckStatus,
  ExerciseCheckType,
  ExerciseSearchQuery,
} from '../graphql/graphqlTypes';
import { PrismaService } from '../prisma/PrismaService';
import { orderBy, uniqBy } from 'lodash';

@Injectable()
export class ExerciseSearchService {
  constructor(private readonly prismaService: PrismaService) {}

  async searchExercises(query: ExerciseSearchQuery) {
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
      status: query.status,
    };
    const countPromise = this.prismaService.exercise.count({
      where,
    });
    const dataPromise = this.prismaService.exercise.findMany({
      skip: query.skip,
      take: query.take,
      where,
      include: {
        checks: true,
      },
      orderBy: query.orderBy
        ? {
            [query.orderBy]: query.orderDirection.toLowerCase() ?? 'desc',
          }
        : undefined,
    });

    const [data, count] = await Promise.all([dataPromise, countPromise]);

    const mapped = data.map((exercise) => {
      const checks = uniqBy(
        orderBy(exercise.checks, 'createdAt', 'desc'),
        (item) => item.userId,
      );
      const good_count = checks.filter(
        (check) => check.type === ExerciseCheckType.GOOD,
      ).length;
      const change_count = checks.filter(
        (check) => check.type === ExerciseCheckType.CHANGE_REQUIRED,
      ).length;
      const delete_count = checks.filter(
        (check) => check.type === ExerciseCheckType.TO_DELETE,
      ).length;
      return { good_count, change_count, delete_count, ...exercise };
    });

    let filtered = [];

    switch (query.checkStatus) {
      case ExerciseCheckStatus.TO_BE_CHECKED:
        filtered = mapped.filter(
          (exercise) => exercise.good_count < 3 && exercise.delete_count === 0,
        );
        break;
      case ExerciseCheckStatus.GOOD:
        filtered = mapped.filter((exercise) => exercise.good_count >= 3);
        break;
      case ExerciseCheckStatus.CHANGE_REQUIRED:
        filtered = mapped.filter(
          (exercise) => exercise.good_count < 3 && exercise.change_count > 0,
        );
        break;
      case ExerciseCheckStatus.TO_DELETE:
        filtered = mapped.filter(
          (exercise) => exercise.good_count < 3 && exercise.delete_count > 0,
        );
        break;
      default:
        filtered = mapped;
    }

    return {
      exercises: filtered,
      totalCount: count,
    };
  }
}
