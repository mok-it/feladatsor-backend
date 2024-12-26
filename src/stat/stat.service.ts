import { Injectable } from '@nestjs/common';
import { LeaderBoardUser, User } from '../graphql/graphqlTypes';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class StatService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserLeaderboard(): Promise<LeaderBoardUser[]> {
    const users = await this.prismaService.user.findMany({
      include: {
        _count: {
          select: { exercises: true },
        },
      },
      orderBy: {
        exercises: {
          _count: 'desc',
        },
      },
    });

    return users.map((user, index) => ({
      user: user as unknown as User,
      rank: index + 1,
      submittedExerciseCount: user._count.exercises,
    }));
  }

  async aggregateExerciseHourly() {
    // Query the data and group by the hour
    const hourlyCounts = await this.prismaService.$queryRaw`SELECT 
          TO_CHAR("createdAt", 'HH24') AS hour, 
          COUNT(*) AS count
      FROM 
          "Exercise"
      GROUP BY 
          hour
      ORDER BY 
          hour;`;

    return (hourlyCounts as { hour: string; count: number }[]).map((a) => ({
      ...a,
      count: parseInt(a.count.toString(), 10),
    }));
  }

  getTotalExerciseCount() {
    return this.prismaService.exercise.count();
  }

  getCheckedExerciseCount() {
    return this.prismaService.exercise.count({
      where: {
        checks: {
          some: {
            type: 'GOOD',
          },
        },
      },
    });
  }
}
