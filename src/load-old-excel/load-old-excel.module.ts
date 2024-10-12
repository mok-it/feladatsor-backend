import { Module } from '@nestjs/common';
import { LoadOldExcelService } from './load-old-excel.service';
import { LoadOldExcelController } from './load-old-excel.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Config } from '../config/config';
import { PrismaService } from '../prisma/PrismaService';
import { UserModule } from '../user/user.module';
import { ExerciseModule } from '../exercise/exercise.module';

@Module({
  imports: [MulterModule, Config, ExerciseModule, UserModule],
  controllers: [LoadOldExcelController],
  providers: [LoadOldExcelService, PrismaService],
})
export class LoadOldExcelModule {}
