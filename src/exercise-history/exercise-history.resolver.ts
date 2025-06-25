import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserService } from '../user/user.service';
import { ExerciseHistoryService } from './exercise-history.service';
import { ExerciseHistory } from '@prisma/client';
import { ImageService } from '../image/image.service';
import { ExerciseHistoryFieldType } from '../graphql/graphqlTypes';
import { ExerciseTagService } from '../exercise-tag/exercise-tag.service';

@Resolver('ExerciseHistory')
export class ExerciseHistoryResolver {
  constructor(
    private readonly exerciseHistoryService: ExerciseHistoryService,
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly exerciseTagService: ExerciseTagService,
  ) {}

  @Query('exerciseHistoryByExercise')
  exerciseHistoryByExercise(@Args('id') id: string) {
    return this.exerciseHistoryService.getHistoryByExerciseId(id);
  }

  @Query('exerciseHistoryByField')
  exerciseHistoryByField(
    @Args('exerciseId') exerciseId: string,
    @Args('field') field: string,
  ) {
    return this.exerciseHistoryService.getHistoryByExerciseIdAndField(
      exerciseId,
      field,
    );
  }

  @ResolveField('createdBy')
  userForHistory(@Parent() exerciseHistory: ExerciseHistory) {
    return this.userService.getUserById(exerciseHistory.userId);
  }

  @ResolveField('fieldType')
  fieldType(@Parent() exerciseHistory: ExerciseHistory): string {
    return this.exerciseHistoryService.determineFieldType(
      exerciseHistory.field,
      exerciseHistory.newValue,
    );
  }

  @ResolveField('oldValue')
  async oldValue(@Parent() exerciseHistory: ExerciseHistory) {
    const fieldType = this.exerciseHistoryService.determineFieldType(
      exerciseHistory.field,
      exerciseHistory.oldValue,
    );

    if (fieldType === ExerciseHistoryFieldType.IMAGE) {
      return this.imageService.resolveGQLImage(exerciseHistory.oldValue);
    }

    if (fieldType === ExerciseHistoryFieldType.JSON) {
      return this.resolveJsonField(
        exerciseHistory.field,
        exerciseHistory.oldValue,
      );
    }

    return { value: exerciseHistory.oldValue };
  }

  @ResolveField('newValue')
  async newValue(@Parent() exerciseHistory: ExerciseHistory) {
    const fieldType = this.exerciseHistoryService.determineFieldType(
      exerciseHistory.field,
      exerciseHistory.newValue,
    );

    if (fieldType === ExerciseHistoryFieldType.IMAGE) {
      return this.imageService.resolveGQLImage(exerciseHistory.newValue);
    }

    if (fieldType === ExerciseHistoryFieldType.JSON) {
      return this.resolveJsonField(
        exerciseHistory.field,
        exerciseHistory.newValue,
      );
    }

    return { value: exerciseHistory.newValue };
  }

  private async resolveJsonField(field: string, value: string) {
    if (!value || value === 'null') {
      return { value };
    }

    try {
      const parsedValue = JSON.parse(value);

      if (field === 'tags' && Array.isArray(parsedValue)) {
        const tags = await Promise.all(
          parsedValue.map((tagId) =>
            this.exerciseTagService.getExerciseTagById(tagId),
          ),
        );
        return { tags: tags.filter(Boolean) };
      }

      if (field === 'contributors' && Array.isArray(parsedValue)) {
        const users = await Promise.all(
          parsedValue.map((userId) => this.userService.getUserById(userId)),
        );
        return { users: users.filter(Boolean) };
      }
    } catch (error) {
      // If JSON parsing fails, return as string
    }

    return { value };
  }
}

@Resolver('HistoryValue')
export class HistoryValueResolver {
  @ResolveField('__resolveType')
  resolveType(value: any) {
    if (value.id && value.url) {
      return 'Image';
    }
    if (value.tags && Array.isArray(value.tags)) {
      return 'HistoryTagArray';
    }
    if (value.users && Array.isArray(value.users)) {
      return 'HistoryUserArray';
    }
    if (value.value !== undefined) {
      return 'HistoryStringValue';
    }
    return null;
  }
}
