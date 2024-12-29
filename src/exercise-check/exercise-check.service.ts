import { Injectable } from '@nestjs/common';
import { ExerciseCheckInput } from '../graphql/graphqlTypes';
import { User } from '@prisma/client';
import { ExerciseCommentService } from '../exercise-comment/exercise-comment.service';
import { PrismaService } from '../prisma/PrismaService';

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
    return this.prismaService.exerciseCheck.create({
      data: {
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
  }

  getChecksByExerciseId(id: string) {
    return this.prismaService.exerciseCheck.findMany({
      where: {
        exerciseId: id,
      },
    });
  }
}
