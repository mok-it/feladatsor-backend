import { Args, Query, Resolver } from '@nestjs/graphql';
import { ExerciseService } from './exercise.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth-guard';

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(private readonly exerciseService: ExerciseService) {}

  @UseGuards(JwtAuthGuard)
  @Query('exercises')
  async getExercises(@Args('take') take: number, @Args('skip') skip: number) {
    return this.exerciseService.getExercises(take, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Query('exercisesCount')
  async getExercisesCount() {
    return this.exerciseService.getExercisesCount();
  }
}
