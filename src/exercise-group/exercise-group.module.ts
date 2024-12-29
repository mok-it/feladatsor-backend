import { Module } from '@nestjs/common';
import { ExerciseGroupService } from './exercise-group.service';
import { ExerciseGroupResolver } from './exercise-group.resolver';
import { PrismaService } from '../prisma/PrismaService';
import { UserModule } from '../user/user.module';
import { ExerciseSheetItemModule } from '../exercise-compose/exercise-sheet-item/exercise-sheet-item.module';

@Module({
  imports: [UserModule, ExerciseSheetItemModule],
  providers: [ExerciseGroupService, PrismaService, ExerciseGroupResolver],
  exports: [ExerciseGroupService],
})
export class ExerciseGroupModule {}
