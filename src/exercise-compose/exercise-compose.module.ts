import { Module } from '@nestjs/common';
import { ExerciseComposeResolver } from './exercise-compose.resolver';
import { ExerciseComposeService } from './exercise-compose.service';
import { PrismaService } from '../prisma/PrismaService';
import { UserModule } from '../user/user.module';
import { ExerciseSheetItemModule } from './exercise-sheet-item/exercise-sheet-item.module';

@Module({
  imports: [UserModule, ExerciseSheetItemModule],
  providers: [ExerciseComposeResolver, ExerciseComposeService, PrismaService],
})
export class ExerciseComposeModule {}
