import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ExerciseHistoryService {
  constructor(private readonly prismaClient: PrismaClient) {}

  getHistoryByExerciseId(id: string) {
    return this.prismaClient.exerciseHistory.findMany({
      where: {
        exerciseId: id,
      },
    });
  }
}
