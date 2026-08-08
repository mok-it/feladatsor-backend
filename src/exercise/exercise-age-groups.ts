import {
  ExerciseAgeGroup,
  ExerciseAgeGroupMetadata,
} from '../graphql/graphqlTypes';

export const exerciseAgeGroups: ExerciseAgeGroupMetadata[] = [
  {
    ageGroup: ExerciseAgeGroup.KOALA,
    name: 'Koala',
    gradeRange: '3-4',
    order: 1,
  },
  {
    ageGroup: ExerciseAgeGroup.MEDVEBOCS,
    name: 'Medvebocs',
    gradeRange: '5-6',
    order: 2,
  },
  {
    ageGroup: ExerciseAgeGroup.KISMEDVE,
    name: 'Kismedve',
    gradeRange: '7-8',
    order: 3,
  },
  {
    ageGroup: ExerciseAgeGroup.NAGYMEDVE,
    name: 'Nagymedve',
    gradeRange: '9-10',
    order: 4,
  },
  {
    ageGroup: ExerciseAgeGroup.JEGESMEDVE,
    name: 'Jegesmedve',
    gradeRange: '11-12',
    order: 5,
  },
];
