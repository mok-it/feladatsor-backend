import { Injectable } from '@nestjs/common';
import { ExerciseCheckInput } from '../graphql/graphqlTypes';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class ExerciseCheckService {
  constructor(private readonly prismaClient: PrismaClient) {}
  createExerciseCheck(input: ExerciseCheckInput, user: User) {
    return this.prismaClient.exerciseCheck.create({
      data: {
        type: input.type,
        exercise: {
          connect: {
            id: input.exerciseId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  getChecksByExerciseId(id: string) {
    return this.prismaClient.exerciseCheck.findMany({
      where: {
        exerciseId: id,
      },
    });
  }
}
