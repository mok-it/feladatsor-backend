import { Injectable } from '@nestjs/common';
import { AgeGroup, Exercise, PrismaClient, User } from '@prisma/client';
import { ExerciseInput, ExerciseUpdateInput } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseService {
  constructor(private readonly prismaClient: PrismaClient) {}

  getExerciseById(id: string) {
    return this.prismaClient.exercise.findFirst({
      where: {
        id,
      },
    });
  }

  async getExercises(take: number, skip: number) {
    return this.prismaClient.exercise.findMany({
      take,
      skip,
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
        id: id,
        alternativeDifficultyExercise: data.alternativeDifficultyParent
          ? {
              connect: {
                id: data.alternativeDifficultyParent,
              },
            }
          : undefined,
        sameLogicExercise: data.sameLogicParent
          ? {
              connect: {
                id: data.sameLogicParent,
              },
            }
          : undefined,
        tags: {
          connect: data.tags.map((tagID) => ({
            id: tagID,
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

  async updateExercise(id: string, data: ExerciseUpdateInput, user: User) {
    return await this.prismaClient.$transaction(async (tx) => {
      //Undefined means we should keep the data
      //Null means an explicit delete
      //Data is present means modify the data
      if (data.difficulty !== undefined) {
        tx.exerciseDifficulty.deleteMany({
          where: {
            exerciseId: id,
          },
        });
      }
      const oldExercise = await tx.exercise.findUnique({
        where: {
          id,
        },
      });
      const differences = this.getDifferences(oldExercise, data);
      //Save differences into history
      await Promise.all(
        differences.map((difference) =>
          tx.exerciseHistory.create({
            data: {
              exercise: {
                connect: {
                  id: oldExercise.id,
                },
              },
              field: difference.field,
              oldValue: String(difference.oldValue),
              newValue: String(difference.newValue),
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          }),
        ),
      );
      if (data.comment) {
        await tx.exerciseComment.create({
          data: {
            exercise: {
              connect: {
                id: id,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            comment: data.comment,
          },
        });
      }
      return tx.exercise.update({
        where: {
          id,
        },
        data: {
          tags: data.tags
            ? {
                set: data.tags.map((id) => ({
                  id,
                })),
              }
            : undefined,
          status: data.status,
          solveIdea: data.solveIdea,
          isCompetitionFinal: data.isCompetitionFinal,
          solutionOptions: data.solutionOptions,
          difficulty: data.difficulty
            ? {
                create: data.difficulty.map((d) => ({
                  ageGroup: d.ageGroup,
                  difficulty: d.difficulty,
                })),
              }
            : undefined,
          description: data.description,
          exerciseImageId: data.exerciseImage,
          solution: data.solution,
          helpingQuestions: data.helpingQuestions,
          source: data.source,
          alternativeDifficultyExercise: data.alternativeDifficultyParent
            ? {
                connect: {
                  id: data.alternativeDifficultyParent,
                },
              }
            : undefined,
          sameLogicExercise: data.sameLogicParent
            ? {
                connect: {
                  id: data.sameLogicParent,
                },
              }
            : undefined,
          solveIdeaImageId: data.solveIdeaImage,
          solutionImageId: data.solutionImage,
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

  getDifficultyByExercise(id: string) {
    return this.prismaClient.exerciseDifficulty.findMany({
      where: {
        exerciseId: id,
      },
    });
  }

  getDifferences(oldExercise: Exercise, newExercise: ExerciseUpdateInput) {
    const fieldsToCheck: (keyof Exercise)[] = [
      'description',
      'helpingQuestions',
      'solution',
      'solutionOptions',
      'solveIdea',
      'source',
      'status',
      'exerciseImageId',
      'solutionImageId',
      'solveIdeaImageId',
    ];

    return fieldsToCheck
      .map((fieldName) => {
        //Undefined means we kept the field as original => No difference
        if (newExercise[fieldName] === undefined) return null;

        const oldValue = oldExercise[fieldName];
        const newValue = newExercise[fieldName];

        const hasChanged = Array.isArray(oldValue)
          ? this.arraysDiffer(oldValue, newValue)
          : oldValue != newValue;

        return hasChanged ? { field: fieldName, oldValue, newValue } : null;
      })
      .filter(Boolean);
  }

  arraysDiffer(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return true;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return true;
      }
    }
    return false;
  }
}
