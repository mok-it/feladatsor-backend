import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExerciseTagService } from './exercise-tag.service';
import { ExerciseTag } from '@prisma/client';

@Resolver('ExerciseTag')
export class ExerciseTagResolver {
  constructor(private readonly exerciseTagService: ExerciseTagService) {}

  @Query('exerciseTags')
  async getExerciseTags() {
    return this.exerciseTagService.getAllExerciseTags();
  }

  @Query('exerciseTag')
  async getExerciseTagById(@Args('id') id: string) {
    return this.exerciseTagService.getExerciseTagById(id);
  }

  @Mutation('createExerciseTag')
  async createExerciseTag(
    @Args('name') name: string,
    @Args('parentId') parentId?: string,
  ) {
    return this.exerciseTagService.createExerciseTag(name, parentId);
  }

  @Mutation('updateExerciseTag')
  async updateExerciseTag(@Args('id') id: string, @Args('name') name: string) {
    return this.exerciseTagService.updateExerciseTag(id, name);
  }

  @Mutation('deleteExerciseTag')
  async deleteExerciseTag(@Args('id') id: string) {
    return this.exerciseTagService.tryToDeleteExerciseTag(id);
  }

  @ResolveField('children')
  async getChildren(@Parent() exerciseTag: ExerciseTag) {
    return this.exerciseTagService.getChildrenById(exerciseTag.id);
  }

  @ResolveField('parent')
  async getParent(@Parent() exerciseTag: ExerciseTag) {
    return this.exerciseTagService.getParentById(exerciseTag.id);
  }

  @ResolveField('exerciseCount')
  async getExerciseCount(@Parent() exerciseTag: ExerciseTag) {
    return this.exerciseTagService.getExerciseCount(exerciseTag.id);
  }
}
