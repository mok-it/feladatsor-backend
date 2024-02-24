import { AgeGroup, PrismaClient } from '@prisma/client';

export const seedAgeGroups = async (prisma: PrismaClient) => {
  const ageGroups: AgeGroup[] = [
    'KOALA',
    'MEDVEBOCS',
    'KISMEDVE',
    'NAGYMEDVE',
    'JEGESMEDVE',
  ];

  /*
  await Promise.all(
    ageGroups.map(async (ageGroupName) => {
      await prisma.exerciseAgeGroup.create({
        data: {
          id: ageGroupName.toLowerCase(),
          ageGroup: ageGroupName,
        },
      });
    }),
  );*/
};
