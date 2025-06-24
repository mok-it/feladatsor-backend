import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import { ExerciseHistoryFieldType } from '../graphql/graphqlTypes';

@Injectable()
export class ExerciseHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  getHistoryByExerciseId(id: string) {
    return this.prismaService.exerciseHistory.findMany({
      where: {
        exerciseId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getHistoryByExerciseIdAndField(exerciseId: string, field: string) {
    return this.prismaService.exerciseHistory.findMany({
      where: {
        exerciseId,
        field,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  determineFieldType(field: string, _value: string): ExerciseHistoryFieldType {
    // Image fields
    if (
      field.includes('Image') ||
      field.includes('image')
    ) {
      return ExerciseHistoryFieldType.IMAGE;
    }

    // JSON fields (arrays and objects stored as JSON strings)
    if (
      field === 'tags' ||
      field === 'contributors' ||
      field === 'difficulty'
    ) {
      return ExerciseHistoryFieldType.JSON;
    }

    // Array fields
    if (field === 'helpingQuestions' || field === 'solutionOptions') {
      return ExerciseHistoryFieldType.ARRAY;
    }

    // Boolean fields
    if (field === 'isCompetitionFinal') {
      return ExerciseHistoryFieldType.BOOLEAN;
    }

    // Enum fields
    if (field === 'status' || field === 'alertSeverty') {
      return ExerciseHistoryFieldType.ENUM;
    }

    // Default to text
    return ExerciseHistoryFieldType.TEXT;
  }
}
