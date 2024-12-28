import { Query, Resolver } from '@nestjs/graphql';
import { ExerciseGroupService } from './exercise-group.service';

@Resolver()
export class ExerciseGroupResolver {
  constructor(private readonly exerciseGroupService: ExerciseGroupService) {}

  @Query('alternativeDifficultyExerciseGroups')
  alternativeDifficultyExerciseGroups() {
    return this.exerciseGroupService.getAlternativeDifficultyExerciseGroups();
  }

  @Query('sameLogicExerciseGroups')
  sameLogicExerciseGroups() {
    return this.exerciseGroupService.getSameLogicExerciseGroups();
  }
}
