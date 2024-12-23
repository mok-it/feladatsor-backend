import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { ExerciseSheetInput } from '../graphql/graphqlTypes';
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
      const sheetItems = await Promise.all(
        sheetData.sheetItems.map((item) => {
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

      return tx.exerciseSheet.create({
        data: {
          name: sheetData.name,
          sheetItems: {
            connect: sheetItems.map((item) => ({ id: item.id })),
          },
          createdBy: { connect: { id: user.id } },
        },
        include: { sheetItems: true },
      });
    });
  }
}
