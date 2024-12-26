import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { StatService } from './stat.service';

@Resolver('GlobalStats')
export class StatResolver {
  constructor(private readonly statService: StatService) {}

  @Query('globalStats')
  globalStats() {
    return {};
  }

  @ResolveField('userLeaderboard')
  userLeaderboard() {
    return this.statService.getUserLeaderboard();
  }

  @ResolveField('exerciseHourlyCount')
  exerciseHourly() {
    return this.statService.aggregateExerciseHourly();
  }

  @ResolveField('totalExerciseCount')
  totalExerciseCount() {
    return this.statService.getTotalExerciseCount();
  }

  @ResolveField('checkedExerciseCount')
  checkedExerciseCount() {
    return this.statService.getCheckedExerciseCount();
  }

  @ResolveField('contributionCalendar')
  contributionCalendar() {
    return this.statService.getContributionCalendar();
  }
}
