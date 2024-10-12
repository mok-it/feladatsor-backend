import { Injectable } from '@nestjs/common';
import { AgeGroup, PrismaClient, User } from '@prisma/client';
import { ExerciseInput } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseService {
  constructor(private readonly prismaClient: PrismaClient) {}

  getExerciseById(id: string) {
    return this.prismaClient.exercise.findFirst({
      where: {
        id,
      },
      include: {
        createdBy: true,
      },
    });
  }

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

  createExercise(data: ExerciseInput, user: User, id?: string) {
    const ageGroups: AgeGroup[] = [
      'KOALA',
      'MEDVEBOCS',
      'KISMEDVE',
      'NAGYMEDVE',
      'JEGESMEDVE',
    ];

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
        id: id,
        tags: {
          connect: data.tags.map((tag) => ({
            id: tag,
          })),
        },
        status: data.status,
        isCompetitionFinal: data.isCompetitionFinal,
        solutionOptions: data.solutionOptions,
        difficulty: {
          //This mapping is done to fill all ageGroup difficulties, even if the frontend does not send every one of them
          create: ageGroups.map((ageGroup) => {
            const difficulty = data.difficulty.find(
              (d) => d.ageGroup == ageGroup,
            )?.difficulty;
            return {
              ageGroup,
              difficulty: difficulty ?? 0,
            };
          }),
        },
        description: data.description,
        exerciseImageId: data.exerciseImage,
        solution: data.solution,
        solutionImageId: data.solutionImage,
        solveIdea: data.solveIdea,
        solveIdeaImageId: data.solveIdeaImage,
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
    return await this.prismaClient.$transaction((tx) => {
      tx.exerciseDifficulty.deleteMany({
        where: {
          exerciseId: id,
        },
      });
      return tx.exercise.update({
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
          exerciseImageId: data.exerciseImage,
          solution: data.solution,
          helpingQuestions: data.helpingQuestions,
          source: data.source,
        },
      });
    });
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
