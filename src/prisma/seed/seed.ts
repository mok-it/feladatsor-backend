import { seedExerciseHistory } from './seedExerciseHistory';
import { seedExerciseChecks } from './seedExerciseChecks';
import { seedExercises } from './seedExercises';
import { seedUsers } from './seedUsers';
import { seedTags } from './seedTags';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../PrismaService';
import { AppModule } from '../../app.module';
import { seedExerciseSheets } from './seedExerciseSheets';
import { seedExerciseGroups } from './seedExerciseGroups';

async function main() {
  const logger = new Logger('Seed');
  const app = await NestFactory.create(AppModule);

  logger.log('Start seeding ...');

  const prisma = app.get(PrismaService);

  logger.log('❌ Truncating tables');
  await prisma.exerciseCheck.deleteMany();
  await prisma.exerciseTag.deleteMany();
  await prisma.exerciseDifficulty.deleteMany();
  await prisma.exerciseHistory.deleteMany();
  await prisma.exerciseGroupSameLogic.deleteMany();
  await prisma.exerciseComment.deleteMany();
  await prisma.exerciseOnExerciseSheetItem.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.exerciseSheetItem.deleteMany();
  await prisma.exerciseSheet.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  logger.log('🌱 Seeding users');
  await seedUsers(app);

  // Seed tags
  logger.log('🌱 Seeding tags');
  await seedTags(prisma);

  // Seed exercise groups
  logger.log('🌱 Seeding exercise groups');
  await seedExerciseGroups(prisma);

  // Seed exercises
  logger.log('🌱 Seeding exercises');
  await seedExercises(prisma, app);

  //Seed exercise sheets
  logger.log('🌱 Seeding exercise sheets');
  await seedExerciseSheets(prisma);

  // Seed exercise checks
  logger.log('🌱 Seeding exercise checks');
  await seedExerciseChecks(prisma);

  // Seed exercise history
  logger.log('🌱 Seeding exercise history');
  await seedExerciseHistory(prisma);

  logger.log('🔥 Seeding finished');

  await app.close();
}

main().catch((e) => console.error(e));
