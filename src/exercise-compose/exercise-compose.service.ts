import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import {
  ExerciseSheetInput,
  ExerciseSheetItemInput,
  UpdateExerciseSheetInput,
} from '../graphql/graphqlTypes';
import { User } from '@prisma/client';

@Injectable()
export class ExerciseComposeService {
  constructor(private readonly prismaService: PrismaService) {}

  getExerciseSheets() {
    return this.prismaService.exerciseSheet.findMany({
      include: { sheetItems: true, talonExercises: true },
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
    return this.prismaService.$transaction(async (tx) => {
      const sheetItems = sheetData.sheetItems
        ? await this.createSheetItems(tx, sheetData.sheetItems)
        : null;

      return tx.exerciseSheet.create({
        data: {
          name: sheetData.name,
          sheetItems: sheetItems
            ? {
                connect: sheetItems.map((item) => ({ id: item.id })),
              }
            : undefined,
          createdBy: { connect: { id: user.id } },
        },
        include: { sheetItems: true, talonExercises: true },
      });
    });
  }

  async updateExerciseSheet(id: string, sheetData: UpdateExerciseSheetInput) {
    return this.prismaService.$transaction(async (tx) => {
      const sheetItems = sheetData.sheetItems
        ? await this.createSheetItems(tx, sheetData.sheetItems)
        : undefined;

      return tx.exerciseSheet.update({
        where: {
          id,
        },
        data: {
          sheetItems: sheetItems
            ? {
                set: sheetItems.map((item) => ({ id: item.id })),
              }
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
          name: sheetData.name ? sheetData.name : undefined,
        },
        include: { sheetItems: true, talonExercises: true },
      });
    });
  }

  private async createSheetItems(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
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
