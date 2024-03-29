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
        //alternativeDifficultyExercise: {
        //  connect: {
        //    id: data.alternativeDifficultyParent,
        //  },
        //},
        //sameLogicExercise: {
        //  connect: {
        //    id: data.sameLogicParent,
        //  },
        //},
        tags: {
          connect: data.tags.map((tag) => ({
            id: tag,
          })),
        },
        status: data.status,
        solveIdea: data.solveIdea,
        isCompetitionFinal: data.isCompetitionFinal,
        solutionOptions: data.solutionOptions,
        difficulty: {
          create: data.difficulty.map((d) => ({
            ageGroup: d.ageGroup,
            difficulty: d.difficulty,
          })),
        },
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

  async updateExercise(id: string, data: ExerciseInput) {
    const res = await this.prismaClient.$transaction([
      this.prismaClient.exerciseDifficulty.deleteMany({
        where: {
          exerciseId: id,
        },
      }),
      this.prismaClient.exercise.update({
        where: {
          id,
        },
        data: {
          tags: {
            set: data.tags.map((id) => ({
              id,
            })),
          },
          status: data.status,
          solveIdea: data.solveIdea,
          isCompetitionFinal: data.isCompetitionFinal,
          solutionOptions: data.solutionOptions,
          difficulty: {
            create: data.difficulty.map((d) => ({
              ageGroup: d.ageGroup,
              difficulty: d.difficulty,
            })),
          },
          description: data.description,
          exerciseImage: data.exerciseImage,
          solution: data.solution,
          elaboration: data.elaboration,
          elaborationImage: data.elaborationImage,
          helpingQuestions: data.helpingQuestions,
          source: data.source,
        },
      }),
    ]);

    return res[res.length - 1];
  }

  getAlternativeDifficultyExercises(exerciseId: string) {
    return this.prismaClient.exercise.findMany({
      where: {
        alternativeDifficultyExerciseId: exerciseId,
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

  getDifficultyByExercise(id: string) {
    return this.prismaClient.exerciseDifficulty.findMany({
      where: {
        exerciseId: id,
      },
    });
  }
}
