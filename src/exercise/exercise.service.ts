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
      include: {
        contributors: true,
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

  getExercisesByUserId(id: string, skip: number, take: number) {
    return this.prismaService.exercise.findMany({
      where: {
        OR: [
          {
            createdById: id,
          },
          {
            contributors: {
              some: {
                id,
              },
            },
          },
        ],
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
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

    return this.prismaService.$transaction(
      async (tx) => {
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
      },
      {
        maxWait: 20_000, // default: 2000
        timeout: 60_000, // default: 5000
      },
    );
  }

  async cloneExerciseToNew(
    id: string,
    user: User,
    createdAt?: Date,
    contributorIDs?: string[],
  ) {
    //Create a new group if the exercise does not already have one
    await this.exerciseGroupService.upsertExerciseGroupSameLogic(id, user);

    return await this.prismaService.$transaction(
      async (tx) => {
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
            contributors:
              contributorIDs && contributorIDs.length > 0
                ? {
                    connect: contributorIDs.map((id) => ({
                      id,
                    })),
                  }
                : undefined,
            id: newId,
            createdAt: createdAt,
            createdById: user.id,
          },
        });
      },
      {
        maxWait: 20_000, // default: 2000
        timeout: 60_000, // default: 5000
      },
    );
  }

  async updateExercise(id: string, data: ExerciseUpdateInput, user: User) {
    return await this.prismaService.$transaction(
      async (tx) => {
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
        const differences = await this.getDifferences(oldExercise, data, tx);
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
            alertDescription: data.alert ? data.alert.description : undefined,
            alertSeverty: data.alert ? data.alert.severity : undefined,
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
            contributors:
              data.contributors != null
                ? {
                    set: data.contributors.map((id) => ({
                      id,
                    })),
                  }
                : undefined,
          },
        });
      },
      {
        maxWait: 20_000, // default: 2000
        timeout: 60_000, // default: 5000
      },
    );
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

    const nextGroupChar = String.fromCharCode(largestLetter.charCodeAt(0) + 1);

    return `${groupPrefix}-${nextGroupChar}`;
  }

  private async getDifferences(
    oldExercise: Exercise,
    newExercise: ExerciseUpdateInput,
    tx: TransactionClient,
  ) {
    const differences = [];

    // Basic field differences
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
      'alertDescription',
      'alertSeverty',
      'isCompetitionFinal',
    ];

    // Check basic fields
    fieldsToCheck.forEach((fieldName) => {
      let newValue = newExercise[fieldName];

      // Handle alert fields mapping
      if (fieldName === 'alertDescription' && newExercise.alert) {
        newValue = newExercise.alert.description;
      } else if (fieldName === 'alertSeverty' && newExercise.alert) {
        newValue = newExercise.alert.severity;
      } else if (
        fieldName === 'exerciseGroupSameLogicId' &&
        newExercise.sameLogicGroup !== undefined
      ) {
        newValue = newExercise.sameLogicGroup;
      }

      // Skip if field is not being updated
      if (
        newValue === undefined &&
        !newExercise.alert &&
        fieldName !== 'alertDescription' &&
        fieldName !== 'alertSeverty'
      )
        return;

      const oldValue = oldExercise[fieldName];

      const hasChanged = Array.isArray(oldValue)
        ? this.arraysDiffer(oldValue, newValue)
        : oldValue != newValue;

      if (hasChanged) {
        differences.push({ field: fieldName, oldValue, newValue });
      }
    });

    // Check image field changes (enhanced tracking)
    const imageFields = [
      { field: 'exerciseImageId', inputField: 'exerciseImage' },
      { field: 'solutionImageId', inputField: 'solutionImage' },
      { field: 'solveIdeaImageId', inputField: 'solveIdeaImage' },
    ];

    imageFields.forEach(({ field, inputField }) => {
      if (newExercise[inputField] !== undefined) {
        const oldValue = oldExercise[field];
        const newValue = newExercise[inputField];

        if (oldValue !== newValue) {
          differences.push({
            field: inputField,
            oldValue: oldValue,
            newValue: newValue,
          });
        }
      }
    });

    // Check tags changes
    if (newExercise.tags !== undefined) {
      const oldExerciseWithTags = await tx.exercise.findUnique({
        where: { id: oldExercise.id },
        include: { tags: true },
      });

      const oldTags = oldExerciseWithTags.tags.map((tag) => tag.id).sort();
      const newTags = newExercise.tags ? [...newExercise.tags].sort() : [];

      if (this.arraysDiffer(oldTags, newTags)) {
        differences.push({
          field: 'tags',
          oldValue: JSON.stringify(oldTags),
          newValue: JSON.stringify(newTags),
        });
      }
    }

    // Check contributors changes
    if (newExercise.contributors !== undefined) {
      const oldExerciseWithContributors = await tx.exercise.findUnique({
        where: { id: oldExercise.id },
        include: { contributors: true },
      });

      const oldContributors = oldExerciseWithContributors.contributors
        .map((contrib) => contrib.id)
        .sort();
      const newContributors = newExercise.contributors
        ? [...newExercise.contributors].sort()
        : [];

      if (this.arraysDiffer(oldContributors, newContributors)) {
        differences.push({
          field: 'contributors',
          oldValue: JSON.stringify(oldContributors),
          newValue: JSON.stringify(newContributors),
        });
      }
    }

    // Check difficulty changes
    if (newExercise.difficulty !== undefined) {
      const oldDifficulties = await tx.exerciseDifficulty.findMany({
        where: { exerciseId: oldExercise.id },
        orderBy: { ageGroup: 'asc' },
      });

      const oldDifficultyMap = oldDifficulties.reduce((acc, diff) => {
        acc[diff.ageGroup] = diff.difficulty;
        return acc;
      }, {});

      const newDifficultyMap = newExercise.difficulty.reduce((acc, diff) => {
        acc[diff.ageGroup] = diff.difficulty;
        return acc;
      }, {});

      if (
        JSON.stringify(oldDifficultyMap) !== JSON.stringify(newDifficultyMap)
      ) {
        differences.push({
          field: 'difficulty',
          oldValue: JSON.stringify(oldDifficultyMap),
          newValue: JSON.stringify(newDifficultyMap),
        });
      }
    }

    return differences;
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
