import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { CreateExerciseSheetCommentInput } from '../graphql/graphqlTypes';
import { User } from '@prisma/client';

@Injectable()
export class ExerciseSheetCommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: CreateExerciseSheetCommentInput, user: User) {
    return this.prismaService.exerciseSheetComment.create({
      data: {
        comment: input.comment,
        userId: user.id,
        exerciseSheetId: input.exerciseSheetId || undefined,
        exerciseSheetItemId: input.exerciseSheetItemId || undefined,
        exerciseOnExerciseSheetItemId: input.exerciseOnExerciseSheetItemId || undefined,
      },
    });
  }

  async resolve(id: string, notes: string | undefined, user: User) {
    return this.prismaService.exerciseSheetComment.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedById: user.id,
        resolutionNotes: notes,
      },
    });
  }

  async delete(id: string) {
    await this.prismaService.exerciseSheetComment.delete({
      where: { id },
    });
    return true;
  }

  async getCommentsBySheetId(sheetId: string) {
    return this.prismaService.exerciseSheetComment.findMany({
      where: {
        OR: [
          { exerciseSheetId: sheetId },
          { exerciseSheetItem: { exerciseSheetId: sheetId } },
          { exerciseOnExerciseSheetItem: { exerciseSheetItem: { exerciseSheetId: sheetId } } }
        ]
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommentsForSheet(sheetId: string) {
    return this.prismaService.exerciseSheetComment.findMany({
      where: { exerciseSheetId: sheetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommentsForSheetItem(itemId: string) {
    return this.prismaService.exerciseSheetComment.findMany({
      where: { exerciseSheetItemId: itemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCommentsForExerciseOnSheet(itemId: string) {
    return this.prismaService.exerciseSheetComment.findMany({
      where: { exerciseOnExerciseSheetItemId: itemId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
