import {Module} from '@nestjs/common';
import {ExerciseGroupService} from './exercise-group.service';
import {ExerciseGroupResolver} from './exercise-group.resolver';
import {PrismaService} from "../prisma/PrismaService";

@Module({
  providers: [ExerciseGroupService, PrismaService, ExerciseGroupResolver],
  exports: [ExerciseGroupService],
})
export class ExerciseGroupModule {}
