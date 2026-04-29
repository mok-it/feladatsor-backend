import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import {
  ExerciseSheetInput,
  ExerciseSheetItemInput,
  UpdateExerciseSheetInput,
} from '../graphql/graphqlTypes';
import {
  ExerciseOnExerciseSheetItem,
  ExerciseSheet,
  ExerciseSheetItem,
  ExerciseSheetStatus,
  Prisma,
  User,
} from '@prisma/client';

@Injectable()
export class ExerciseComposeService {
  constructor(private readonly prismaService: PrismaService) {}

  getExerciseSheets(searchQuery?: string, skip?: number, take?: number) {
    return this.prismaService.exerciseSheet.findMany({
      include: { sheetItems: true, talonExercises: true },
      where: searchQuery
        ? {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          }
        : {},
      skip: skip,
      take: take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getExerciseSheetById(id: string) {
    return this.prismaService.exerciseSheet.findUnique({
      where: { id },
      include: { sheetItems: true, talonExercises: true },
    });
  }

  createExerciseSheet(sheetData: ExerciseSheetInput, user: User) {
    // Validate configuration
    this.validateSheetConfiguration(sheetData);

    return this.prismaService.$transaction(async (tx) => {
      const sheetItems = sheetData.sheetItems
        ? await this.createSheetItems(tx, sheetData.sheetItems)
        : null;

      const maxExercisesPerLevel: number[] = sheetData.maxExercisesPerLevel ?? [
        10, 10, 10, 10,
      ];

      return tx.exerciseSheet.create({
        data: {
          name: sheetData.name,
          maxExercisesPerLevel: maxExercisesPerLevel,
          sheetItems: sheetItems
            ? {
                connect: sheetItems.map((item) => ({ id: item.id })),
              }
            : undefined,
          createdBy: { connect: { id: user.id } },
          status: ExerciseSheetStatus.DRAFT,
        },
        include: { sheetItems: true, talonExercises: true },
      });
    });
  }

  async updateExerciseSheet(id: string, sheetData: UpdateExerciseSheetInput) {
    return this.prismaService.$transaction(async (tx) => {
      // Fetch existing sheet with all items and exercises
      const existingSheet = await tx.exerciseSheet.findUnique({
        where: { id },
        include: {
          sheetItems: {
            include: {
              exercises: true,
            },
          },
        },
      });

      if (!existingSheet) {
        throw new BadRequestException(`Exercise sheet with id ${id} not found`);
      }

      // Validate configuration changes with existing data
      this.validateSheetConfiguration(sheetData, existingSheet);

      // Create new sheet items if provided
      const sheetItems = sheetData.sheetItems
        ? await this.createSheetItems(tx, sheetData.sheetItems)
        : undefined;

      return tx.exerciseSheet.update({
        where: { id },
        data: {
          name: sheetData.name ?? undefined,
          status: sheetData.status ?? undefined,
          maxExercisesPerLevel: sheetData.maxExercisesPerLevel ?? undefined,
          sheetItems: sheetItems
            ? { set: sheetItems.map((item) => ({ id: item.id })) }
            : undefined,
          talonExercises: sheetData.talonItems
            ? {
                deleteMany: {},
                create: sheetData.talonItems.map((item) => ({
                  exerciseId: item.exerciseID,
                  order: item.order,
                })),
              }
            : undefined,
        },
        include: { sheetItems: true, talonExercises: true },
      });
    });
  }

  private validateSheetConfiguration(
    sheetData: ExerciseSheetInput | UpdateExerciseSheetInput,
    existingSheet?: ExerciseSheet & {
      sheetItems: (ExerciseSheetItem & {
        exercises: ExerciseOnExerciseSheetItem[];
      })[];
    },
  ): void {
    // Determine max exercises per level
    const maxExercisesPerLevel: number[] = sheetData.maxExercisesPerLevel ??
      existingSheet?.maxExercisesPerLevel ?? [10, 10, 10, 10];

    // Derive number of levels from array length
    const numberOfLevels = maxExercisesPerLevel.length;

    // Validate array is not empty
    if (sheetData.maxExercisesPerLevel && numberOfLevels === 0) {
      throw new BadRequestException(
        'maxExercisesPerLevel array cannot be empty',
      );
    }

    // Validate each element in the array
    if (sheetData.maxExercisesPerLevel) {
      for (let i = 0; i < sheetData.maxExercisesPerLevel.length; i++) {
        const maxForLevel = sheetData.maxExercisesPerLevel[i];
        if (maxForLevel < 1 || maxForLevel > 100) {
          throw new BadRequestException(
            `Maximum exercises for level ${i} must be between 1 and 100, got ${maxForLevel}`,
          );
        }
      }
    }

    // Validate sheet items if provided
    if (sheetData.sheetItems) {
      for (const item of sheetData.sheetItems) {
        // Validate level is within range
        if (item.level < 0 || item.level >= numberOfLevels) {
          throw new BadRequestException(
            `Level ${item.level} is out of range. Must be between 0 and ${
              numberOfLevels - 1
            } (based on maxExercisesPerLevel array length)`,
          );
        }

        // Check if this specific sheet item exceeds the max for its level
        const maxForThisLevel = maxExercisesPerLevel[item.level];
        if (item.exercises.length > maxForThisLevel) {
          throw new BadRequestException(
            `Age group ${item.ageGroup} level ${item.level} has ${item.exercises.length} exercises, ` +
              `but maximum for this level is ${maxForThisLevel}`,
          );
        }
      }
    }

    // EDGE CASE: Changing maxExercisesPerLevel on existing sheet
    if (
      existingSheet &&
      sheetData.maxExercisesPerLevel !== undefined &&
      sheetData.maxExercisesPerLevel !== null &&
      !sheetData.sheetItems
    ) {
      const newMaxExercises = sheetData.maxExercisesPerLevel;
      const newNumberOfLevels = newMaxExercises.length;

      // Check for violations in exercise counts
      const violations: string[] = [];
      for (const item of existingSheet.sheetItems) {
        // Check if level exists in new array
        if (item.level >= newNumberOfLevels) {
          violations.push(
            `${item.ageGroup} Level ${item.level}: level no longer exists (new array has ${newNumberOfLevels} levels)`,
          );
        } else {
          const maxForLevel = newMaxExercises[item.level];
          if (item.exercises.length > maxForLevel) {
            violations.push(
              `${item.ageGroup} Level ${item.level}: ${item.exercises.length} exercises (max: ${maxForLevel})`,
            );
          }
        }
      }

      if (violations.length > 0) {
        throw new BadRequestException(
          `Cannot update maxExercisesPerLevel. The following items exceed the new limits:\n` +
            violations.join('\n') +
            `\n\nPlease remove exercises from these items or adjust the array before updating.`,
        );
      }
    }
  }

  private async createSheetItems(
    tx: Prisma.TransactionClient,
    sheetItems: ExerciseSheetItemInput[],
  ) {
    return Promise.all(
      sheetItems.map((sheetItem) => {
        return tx.exerciseSheetItem.create({
          data: {
            exercises: {
              create: sheetItem.exercises.map((exercise) => ({
                exerciseId: exercise.exerciseID,
                order: exercise.order,
              })),
            },
            ageGroup: sheetItem.ageGroup,
            level: sheetItem.level,
          },
        });
      }),
    );
  }

  async deleteExerciseSheet(id: string) {
    await this.prismaService.exerciseSheet.delete({
      where: { id },
    });
    return true;
  }
}
