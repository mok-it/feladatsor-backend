import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class ExerciseCommentService {
  constructor(private readonly prismaService: PrismaService) {}

  getCommentsByExerciseId(id: string) {
    return this.prismaService.exerciseComment.findMany({
      where: {
        exerciseId: id,
      },
    });
  }

  getExerciseCommentById(id: string) {
    return this.prismaService.exerciseComment.findUnique({
      where: {
        id: id,
      },
    });
  }

  createExerciseComment(
    exerciseId: string,
    comment: string,
    user: User,
    contributors?: string[],
  ) {
    return this.prismaService.exerciseComment.create({
      data: {
        comment,
        exercise: {
          connect: {
            id: exerciseId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        contributors: contributors
          ? {
              connect: contributors.map((id) => ({
                id,
              })),
            }
          : undefined,
      },
    });
  }

  updateExerciseComment(id: string, comment: string, contributors: string[]) {
    return this.prismaService.exerciseComment.update({
      where: {
        id,
      },
      data: {
        comment,
        contributors: contributors
          ? {
              connect: contributors.map((id) => ({
                id,
              })),
            }
          : undefined,
      },
    });
  }

  async deleteExerciseComment(id: string) {
    return this.prismaService.exerciseComment.delete({
      where: {
        id,
      },
    });
  }

  async getContributors(id: string) {
    const comment = await this.prismaService.exerciseComment.findUnique({
      where: { id },
      include: { contributors: true },
    });

    return comment.contributors;
  }
}
