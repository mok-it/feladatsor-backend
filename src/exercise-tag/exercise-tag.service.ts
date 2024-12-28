import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';

@Injectable()
export class ExerciseTagService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllExerciseTags() {
    const tags = await this.prismaService.exerciseTag.findMany({
      include: {
        _count: {
          select: {
            exercises: true,
          },
        },
      },
      orderBy: {
        exercises: {
          _count: 'desc',
        },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      exerciseCount: tag._count.exercises,
    }));
  }

  async getAllTopLevelExerciseTags() {
    const tags = await this.prismaService.exerciseTag.findMany({
      where: {
        children: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            exercises: true,
          },
        },
      },
      orderBy: {
        exercises: {
          _count: 'desc',
        },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      exerciseCount: tag._count.exercises,
    }));
  }

  async getExerciseTagById(id: string) {
    return this.prismaService.exerciseTag.findUnique({
      where: {
        id,
      },
    });
  }

  createExerciseTag(name: string, parentId?: string) {
    return this.prismaService.exerciseTag.create({
      data: {
        name,
        parentTag: parentId
          ? {
              connect: {
                id: parentId,
              },
            }
          : undefined,
      },
    });
  }

  getChildrenById(id: string) {
    return this.prismaService.exerciseTag.findMany({
      where: {
        parentTag: {
          id,
        },
      },
    });
  }

  getParentById(childId: string) {
    return this.prismaService.exerciseTag.findFirst({
      where: {
        children: {
          some: {
            id: childId,
          },
        },
      },
    });
  }

  updateExerciseTag(id: string, name: string) {
    return this.prismaService.exerciseTag.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }

  /*
   * This method only should delete the exercise tag with the given id, when there are no exercises
   * or children tags associated with it.
   */
  async tryToDeleteExerciseTag(id: string) {
    const count = await this.prismaService.exerciseTag.deleteMany({
      where: {
        id,
        AND: {
          exercises: {
            none: {},
          },
          children: {
            none: {},
          },
        },
      },
    });
    if (count.count === 0) {
      throw new Error('Could not delete tag');
    }
    return true;
  }

  getTagsByExerciseId(id: string) {
    return this.prismaService.exerciseTag.findMany({
      where: {
        exercises: {
          some: {
            id: id,
          },
        },
      },
    });
  }

  getExerciseCount(id: string) {
    return this.prismaService.exercise.count({
      where: {
        tags: {
          some: {
            id,
          },
        },
      },
    });
  }
}
