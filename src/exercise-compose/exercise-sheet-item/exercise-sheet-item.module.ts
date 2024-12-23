import { Module } from '@nestjs/common';
import { ExerciseSheetItemService } from './exercise-sheet-item.service';
import { ExerciseSheetItemResolver } from './exercise-sheet-item.resolver';
import { PrismaService } from '../../prisma/PrismaService';

@Module({
  providers: [
    ExerciseSheetItemResolver,
    ExerciseSheetItemService,
    PrismaService,
  ],
})
export class ExerciseSheetItemModule {}
