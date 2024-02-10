import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ExerciseService {
  constructor(private readonly prismaClient: PrismaClient) {}

  async getExercises(take: number, skip: number) {
    return this.prismaClient.exercise.findMany({
      take,
      skip,
    });
  }

  getExercisesCount() {
    return this.prismaClient.exercise.count();
  }
}
