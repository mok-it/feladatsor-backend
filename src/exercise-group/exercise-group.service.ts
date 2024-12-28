import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/PrismaService';
import { SameLogicExerciseGroupInput } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getSameLogicExerciseGroups() {
    return this.prisma.exerciseGroupSameLogic.findMany({
      include: {
        exercises: true,
        createdBy: true,
      },
    });
  }

  getGroupById(exerciseGroupSameLogicId?: string) {
    if (!exerciseGroupSameLogicId) return null;
    return this.prisma.exerciseGroupSameLogic.findUnique({
      where: {
        id: exerciseGroupSameLogicId,
      },
      include: {
        exercises: true,
        createdBy: true,
      },
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

  createSameLogicExerciseGroup(data: SameLogicExerciseGroupInput, user: User) {
    return this.prisma.exerciseGroupSameLogic.create({
      data: {
        createdBy: {
          connect: {
            id: user.id,
          },
        },
        description: data.description,
      },
      include: {
        exercises: true,
        createdBy: true,
      },
    });
  }
}
