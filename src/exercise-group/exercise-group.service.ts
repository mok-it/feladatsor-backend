import {Injectable} from '@nestjs/common';
import {User} from '@prisma/client';
import {PrismaService} from "../prisma/PrismaService";

@Injectable()
export class ExerciseGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlternativeDifficultyExerciseGroups() {
    return this.prisma.exerciseGroupAlternativeDifficulty.findMany({
      include: {
        exercises: true,
        createdBy: true,
      },
    });
  }

  async getSameLogicExerciseGroups() {
    return this.prisma.exerciseGroupSameLogic.findMany({
      include: {
        exercises: true,
        createdBy: true,
      },
    });
  }

  async upsertExerciseGroupAlternativeDifficulty(
    exerciseID: string,
    user: User,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const exercise = await tx.exercise.findFirst({
        where: {
          id: exerciseID,
        },
      });

      if (exercise.exerciseGroupAlternativeDifficultyId) {
        return tx.exerciseGroupAlternativeDifficulty.findFirst({
          where: {
            id: exercise.exerciseGroupAlternativeDifficultyId,
          },
        });
      }

      return tx.exerciseGroupAlternativeDifficulty.create({
        data: {
          createdBy: {
            connect: {
              id: user.id,
            },
          },
          exercises: {
            connect: {
              id: exercise.id,
            },
          },
        },
      });
    });
  }

  async upsertExerciseGroupSameLogic(exerciseID: string, user: User) {
    return this.prisma.$transaction(async (tx) => {
      const exercise = await tx.exercise.findFirst({
        where: {
          id: exerciseID,
        },
      });

      if (exercise.exerciseGroupSameLogicId) {
        return tx.exerciseGroupSameLogic.findFirst({
          where: {
            id: exercise.exerciseGroupSameLogicId,
          },
        });
      }

      return tx.exerciseGroupSameLogic.create({
        data: {
          createdBy: {
            connect: {
              id: user.id,
            },
          },
          exercises: {
            connect: {
              id: exercise.id,
            },
          },
        },
      });
    });
  }
}
