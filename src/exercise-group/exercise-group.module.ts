import { Module } from '@nestjs/common';
import { ExerciseGroupService } from './exercise-group.service';
import { ExerciseGroupResolver } from './exercise-group.resolver';
import { UserModule } from '../user/user.module';
import { ExerciseSheetItemModule } from '../exercise-compose/exercise-sheet-item/exercise-sheet-item.module';

@Module({
  imports: [UserModule, ExerciseSheetItemModule],
  providers: [ExerciseGroupService, ExerciseGroupResolver],
  exports: [ExerciseGroupService],
})
export class ExerciseGroupModule {}
