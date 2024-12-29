import { PrismaService } from '../PrismaService';

export async function seedFunkyPool(prisma: PrismaService) {
  const developers = ['DH Anna', 'Rumi Zoárd', 'Kostyál Bálint', 'Imre Balázs'];
  await prisma.developer.createMany({
    data: developers.map((dev) => ({
      count: 0,
      name: dev,
    })),
  });
}
