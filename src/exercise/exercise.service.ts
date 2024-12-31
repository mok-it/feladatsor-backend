import { Injectable } from '@nestjs/common';
import { AgeGroup, Exercise, User } from '@prisma/client';
import { ExerciseInput, ExerciseUpdateInput } from '../graphql/graphqlTypes';
import { PrismaService } from '../prisma/PrismaService';
import { ExerciseGroupService } from '../exercise-group/exercise-group.service';
import { Prisma } from '@prisma/client/extension';
import TransactionClient = Prisma.TransactionClient;

@Injectable()
export class ExerciseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly exerciseGroupService: ExerciseGroupService,
  ) {}

  getExerciseById(id: string) {
    return this.prismaService.exercise.findUnique({
      where: {
        id,
      },
    });
  }

  async getExercises(take: number, skip: number) {
    return this.prismaService.exercise.findMany({
      take,
      skip,
    });
  }

  getExercisesCount() {
    return this.prismaService.exercise.count();
  }

  getExercisesByUserId(id: string) {
    return this.prismaService.exercise.findMany({
      where: {
        createdById: id,
      },
    });
  }

  createExercise(
    data: ExerciseInput & { createdAt?: Date },
    user: User,
    extraOverrides?: {
      id?: string;
      originalId?: string;
      createdAtYear?: number;
    },
  ) {
    const ageGroups: AgeGroup[] = [
      'KOALA',
      'MEDVEBOCS',
      'KISMEDVE',
      'NAGYMEDVE',
      'JEGESMEDVE',
    ];

    return this.prismaService.$transaction(async (tx) => {
      const generatedId = await this.generateNextExerciseId(
        tx,
        extraOverrides && extraOverrides.createdAtYear,
      );
      return tx.exercise.create({
        data: {
          id:
            extraOverrides && extraOverrides.id
              ? extraOverrides.id
              : generatedId,
          originalId:
            extraOverrides && extraOverrides.originalId
              ? extraOverrides.originalId
              : undefined,
          sameLogicExerciseGroup: data.sameLogicGroup
            ? {
                connect: {
                  id: data.sameLogicGroup,
                },
              }
            : undefined,
          tags: {
            connect: data.tags.map((tagID) => ({
              id: tagID,
            })),
          },
          status: data.status,
          alertDescription: data.alert && data.alert.description,
          alertSeverty: data.alert && data.alert.severity,
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
          createdAt: data.createdAt,
          createdBy: {
            connect: {
              id: user.id,
            },
          },
          contributors: data.contributors
            ? {
                connect: data.contributors.map((id) => ({
                  id,
                })),
              }
            : undefined,
        },
      });
    });
  }

  async cloneExerciseToNew(id: string, user: User, createdAt?: Date) {
    //Create a new group if the exercise does not already have one
    await this.exerciseGroupService.upsertExerciseGroupSameLogic(id, user);

    return await this.prismaService.$transaction(async (tx) => {
      const newId = await this.generateNextIdInGroup(id, tx);
      const oldExercise = await tx.exercise.findUnique({
        where: { id },
        include: {
          difficulty: true,
          tags: true,
        },
      });
      const propsToDelete: (keyof Exercise)[] = [
        'id',
        'createdAt',
        'updatedAt',
        'createdById',
      ];
      propsToDelete.forEach((key) => {
        delete oldExercise[key];
      });

      return tx.exercise.create({
        data: {
          ...oldExercise,
          difficulty: {
            create: oldExercise.difficulty.map((diff) => ({
              difficulty: diff.difficulty,
              ageGroup: diff.ageGroup,
            })),
          },
          tags: {
            connect: oldExercise.tags.map((tag) => ({
              id: tag.id,
            })),
          },
          id: newId,
          createdAt: createdAt,
          createdById: user.id,
        },
      });
    });
  }

  async updateExercise(id: string, data: ExerciseUpdateInput, user: User) {
    return await this.prismaService.$transaction(async (tx) => {
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
          alertDescription: data.alert.description,
          alertSeverty: data.alert.severity,
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
          sameLogicExerciseGroup: data.sameLogicGroup
            ? {
                connect: {
                  id: data.sameLogicGroup,
                },
              }
            : undefined,
          solveIdeaImageId: data.solveIdeaImage,
          solutionImageId: data.solutionImage,
          contributors: {
            connect: data.contributors.map((id) => ({
              id,
            })),
          },
        },
      });
    });
  }

  async getSameLogicExercises(exerciseId: string) {
    const otherExercise = await this.getExerciseById(exerciseId);
    if (!otherExercise || !otherExercise.exerciseGroupSameLogicId) {
      return [];
    }
    return this.prismaService.exercise.findMany({
      where: {
        sameLogicExerciseGroup: {
          id: otherExercise.exerciseGroupSameLogicId,
        },
      },
    });
  }

  getDifficultyByExercise(id: string) {
    return this.prismaService.exerciseDifficulty.findMany({
      where: {
        exerciseId: id,
      },
    });
  }

  async getContributors(id: string) {
    const ex = await this.prismaService.exercise.findUnique({
      where: { id },
      include: { contributors: true },
    });

    return ex.contributors;
  }

  async generateNextExerciseId(
    tx: TransactionClient,
    currentYear: number = new Date().getFullYear(),
  ) {
    //ID format: <2 digi of year>-<3 digit incremental id>-<group_location(a,b,c ...)>

    const yearPrefix = currentYear.toString().slice(-2);

    const lastExerciseInThisYear = await tx.exercise.findFirst({
      where: {
        id: {
          startsWith: yearPrefix,
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (lastExerciseInThisYear) {
      const idParts = lastExerciseInThisYear.id.split('-');
      if (idParts.length != 3)
        throw new Error(
          `Invalid id found: [${lastExerciseInThisYear.id}], can't generate next id`,
        );
      return `${idParts[0]}-${(Number(idParts[1]) + 1)
        .toString()
        .padStart(3, '0')}-${idParts[2]}`;
    }

    return `${yearPrefix}-001-a`;
  }

  async generateNextIdInGroup(
    exerciseInGroupId: string,
    tx: TransactionClient,
  ) {
    const exercise = await tx.exercise.findUnique({
      where: {
        id: exerciseInGroupId,
      },
      include: {
        sameLogicExerciseGroup: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!exercise.sameLogicExerciseGroup) {
      throw new Error(
        `Exercise [${exerciseInGroupId}] must be in a group to generate nextGroupId for it`,
      );
    }

    const idsInGroup = exercise.sameLogicExerciseGroup.exercises.map(
      (exercise) => exercise.id,
    );
    const groupPrefix = `${idsInGroup[0].split('-')[0]}-${
      idsInGroup[0].split('-')[1]
    }`;

    const largestLetter = idsInGroup
      .map((id) => {
        const idParts = id.split('-');
        if (idParts.length != 3)
          throw new Error(
            `Invalid id found: [${id}], can't generate next id in group`,
          );
        return idParts[2];
      })
      .reduce((max, current) => (current > max ? current : max));

    let nextGroupChar = String.fromCharCode(largestLetter.charCodeAt(0) + 1);

    return `${groupPrefix}-${nextGroupChar}`;
  }

  private getDifferences(
    oldExercise: Exercise,
    newExercise: ExerciseUpdateInput,
  ) {
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

  private arraysDiffer(arr1: string[], arr2: string[]): boolean {
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
