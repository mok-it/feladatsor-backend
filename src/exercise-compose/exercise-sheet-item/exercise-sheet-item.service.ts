import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/PrismaService';

@Injectable()
export class ExerciseSheetItemService {
  constructor(private readonly prismaService: PrismaService) {}

  async getExercisesBySheetItemId(id: string) {
    const ex = await this.prismaService.exerciseSheetItem
      .findUnique({
        where: { id },
      })
      .exercises();

    console.log(ex);

    return ex;
  }
}
