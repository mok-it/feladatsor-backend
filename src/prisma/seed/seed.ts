import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seedUsers';
import { seedExerciseHistory } from './seedExerciseHistory';
import { seedExerciseChecks } from './seedExerciseChecks';
import { seedExercises } from './seedExercises';
import { seedAgeGroups } from './seedAgeGroups';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  console.log('❌ Truncating tables');
  await prisma.exerciseCheck.deleteMany();
  await prisma.exerciseAgeGroup.deleteMany();
  await prisma.exerciseDifficulty.deleteMany();
  await prisma.exerciseHistory.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  console.log('🌱 Seeding users');
  await seedUsers(prisma);

  // Seed age groups
  console.log('🌱 Seeding age groups');
  await seedAgeGroups(prisma);

  // Seed exercises
  console.log('🌱 Seeding exercises');
  await seedExercises(prisma);

  // Seed exercise checks
  console.log('🌱 Seeding exercise checks');
  await seedExerciseChecks(prisma);

  // Seed exercise history
  console.log('🌱 Seeding exercise history');
  await seedExerciseHistory(prisma);

  console.log('🔥 Seeding finished');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
