import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class FunkyPoolService {
  constructor(private readonly prismaService: PrismaService) {}

  voteOnDeveloper(id: string) {
    return this.prismaService.$transaction(async (tx) => {
      const dev = await tx.developer.findUnique({
        where: {
          id,
        },
      });

      return tx.developer.update({
        where: { id },
        data: {
          count: dev.count + 1,
        },
      });
    });
  }
  getFunkyPool() {
    return this.prismaService.developer.findMany({});
  }
}
