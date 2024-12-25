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
      include: { sheetItems: true },
    });
  }

  getExerciseSheetById(id: string) {
    return this.prismaService.exerciseSheet.findUnique({
      where: { id },
      include: { sheetItems: true },
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
        include: { sheetItems: true },
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
                deleteMany: {},
                connect: sheetItems.map((item) => ({ id: item.id })),
              }
            : undefined,
          name: sheetData.name ? sheetData.name : undefined,
        },
        include: { sheetItems: true },
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
      sheetItems.map((item) => {
        return tx.exerciseSheetItem.create({
          data: {
            exercises: {
              connect: item.exercises.map((exerciseId) => ({
                id: exerciseId,
              })),
            },
            ageGroup: item.ageGroup,
            level: item.level,
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
