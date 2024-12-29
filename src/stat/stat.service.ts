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

  getTotalExerciseCount(userId?: string) {
    return this.prismaService.exercise.count(
      userId
        ? {
            where: {
              createdById: userId,
            },
          }
        : undefined,
    );
  }

  getCheckedExerciseCount(userId?: string) {
    return this.prismaService.exercise.count({
      where: {
        createdById: userId,
        checks: {
          some: {
            type: 'GOOD',
          },
        },
      },
    });
  }

  async getContributionCalendar(userId?: string) {
    // Query the data and group by the hour
    const dailyCounts = userId
      ? await this.prismaService.$queryRaw`SELECT 
        TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
        COUNT(*) AS count
    FROM 
        "Exercise"
    WHERE 
        "createdById" = ${userId}
        AND "createdAt" >= DATE_TRUNC('year', CURRENT_DATE)
        AND "createdAt" < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
    GROUP BY 
        day
    ORDER BY 
        day;`
      : //If we want to query everything (no userId provided)
        await this.prismaService.$queryRaw`SELECT 
        TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
        COUNT(*) AS count
    FROM 
        "Exercise"
    WHERE 
        "createdAt" >= DATE_TRUNC('year', CURRENT_DATE)
        AND "createdAt" < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
    GROUP BY 
        day
    ORDER BY 
        day;`;

    const data = (dailyCounts as { day: string; count: number }[]).map((a) => ({
      ...a,
      count: parseInt(a.count.toString(), 10),
    }));

    const min = Math.min(...data.map((d) => d.count));
    const max = Math.max(...data.map((d) => d.count));

    return {
      fromDate: data[0] ? data[0].day : `${new Date().getFullYear()}-01-01`,
      toDate: data[0]
        ? data[data.length - 1].day
        : `${new Date().getFullYear()}-12-31`,
      data: data.map((d) => ({
        date: d.day,
        count: d.count,
        level:
          min === max ? 4 : Math.round(((d.count - min) / (max - min)) * 4),
      })),
    };
  }
}
