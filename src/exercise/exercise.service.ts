import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { ExerciseInput } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseService {
  constructor(private readonly prismaClient: PrismaClient) {}

  async getExercises(take: number, skip: number) {
    return this.prismaClient.exercise.findMany({
      take,
      skip,
      include: {
        createdBy: true,
      },
    });
  }

  getExercisesCount() {
    return this.prismaClient.exercise.count();
  }

  getExercisesByUserId(id: string) {
    return this.prismaClient.exercise.findMany({
      where: {
        createdById: id,
      },
      include: {
        createdBy: true,
      },
    });
  }

  createExercise(data: ExerciseInput, user: User) {
    return this.prismaClient.exercise.create({
      data: {
        name: data.name,
        description: data.description,
        exerciseImage: data.exerciseImage,
        solution: data.solution,
        elaboration: data.elaboration,
        elaborationImage: data.elaborationImage,
        helpingQuestions: data.helpingQuestions,
        source: data.source,
        createdBy: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  getSimilarExercises(exerciseId: string) {
    return this.prismaClient.exercise.findMany({
      where: {
        similarExerciseId: exerciseId,
      },
    });
  }

  getHistory(id: string) {
    return this.prismaClient.exerciseHistory.findMany({
      where: {
        exerciseId: id,
      },
    });
  }
}
