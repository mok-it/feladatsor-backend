import { Injectable } from '@nestjs/common';
import { ExerciseCheckInput } from '../graphql/graphqlTypes';
import { AggregatedCheckStatus, ExerciseCheck, User } from '@prisma/client';
import { ExerciseCommentService } from '../exercise-comment/exercise-comment.service';
import { PrismaService } from '../prisma/PrismaService';
import { Prisma } from '@prisma/client/extension';
import TransactionClient = Prisma.TransactionClient;

@Injectable()
export class ExerciseCheckService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly exerciseCommentService: ExerciseCommentService,
  ) {}
  async createExerciseCheck(input: ExerciseCheckInput, user: User) {
    if (input.comment) {
      await this.exerciseCommentService.createExerciseComment(
        input.exerciseId,
        input.comment,
        user,
        input.contributors,
      );
    }
    return this.prismaService.$transaction(
      async (tx) => {
        const exerciseCheck = await tx.exerciseCheck.upsert({
          where: {
            exerciseId_userId: {
              exerciseId: input.exerciseId,
              userId: user.id,
            },
          },
          update: {
            type: input.type,
            contributors: input.contributors
              ? {
                  set: input.contributors.map((id) => ({
                    id,
                  })),
                }
              : undefined,
          },
          create: {
            type: input.type,
            exercise: {
              connect: {
                id: input.exerciseId,
              },
            },
            contributors: input.contributors
              ? {
                  connect: input.contributors.map((id) => ({
                    id,
                  })),
                }
              : undefined,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        await this.doExerciseCheckAggregation(input.exerciseId, tx);

        return exerciseCheck;
      },
      {
        timeout: 15_000,
      },
    );
  }

  getChecksByExerciseId(id: string) {
    return this.prismaService.exerciseCheck.findMany({
      where: {
        exerciseId: id,
      },
    });
  }

  async doExerciseCheckAggregation(
    exerciseId: string,
    tx: TransactionClient = this.prismaService,
  ) {
    const ex = await tx.exercise.findUnique({
      where: {
        id: exerciseId,
      },
      include: {
        checks: true,
      },
    });

    await tx.exercise.update({
      where: {
        id: exerciseId,
      },
      data: {
        aggregatedCheckStatus: this.aggregateExerciseChecks(ex.checks),
      },
    });
  }

  private aggregateExerciseChecks(
    checks: ExerciseCheck[],
  ): AggregatedCheckStatus {
    const strChecks = checks.map((c) => c.type);

    if (strChecks.filter((c) => c === 'GOOD').length >= 3) {
      return AggregatedCheckStatus.GOOD;
    }
    if (strChecks.filter((c) => c === 'TO_DELETE').length > 0) {
      return AggregatedCheckStatus.TO_DELETE;
    }
    if (strChecks.filter((c) => c === 'CHANGE_REQUIRED').length > 0) {
      return AggregatedCheckStatus.CHANGE_REQUIRED;
    }
    return AggregatedCheckStatus.NEEDS_TO_BE_CHECKED;
  }
}
