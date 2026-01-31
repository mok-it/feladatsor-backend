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
        user: {
          connect: { id: user.id },
        },
        exerciseSheet: input.exerciseSheetId
          ? { connect: { id: input.exerciseSheetId } }
          : undefined,
        exerciseSheetItem: input.exerciseSheetItemId
          ? { connect: { id: input.exerciseSheetItemId } }
          : undefined,
        exerciseOnExerciseSheetItem: input.exerciseOnExerciseSheetItemId
          ? { connect: { id: input.exerciseOnExerciseSheetItemId } }
          : undefined,
        contributors:
          input.contributorIds && input.contributorIds.length > 0
            ? {
                connect: input.contributorIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });
  }

  async resolveSheetComment(id: string, notes: string | undefined, user: User) {
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
          {
            exerciseOnExerciseSheetItem: {
              exerciseSheetItem: { exerciseSheetId: sheetId },
            },
          },
        ],
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
