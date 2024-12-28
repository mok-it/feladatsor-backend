import {Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/PrismaService";

@Injectable()
export class ExerciseHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  getHistoryByExerciseId(id: string) {
    return this.prismaService.exerciseHistory.findMany({
      where: {
        exerciseId: id,
      },
    });
  }
}
