import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/PrismaService';

@Injectable()
export class ExerciseSheetItemService {
  constructor(private readonly prismaService: PrismaService) {}

  getExercisesBySheetItemId(id: string) {
    return this.prismaService.exerciseSheetItem
      .findUnique({
        where: { id },
      })
      .exercises();
  }
}
