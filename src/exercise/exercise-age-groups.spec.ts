import { ExerciseAgeGroup } from '../graphql/graphqlTypes';
import { exerciseAgeGroups } from './exercise-age-groups';

describe('exerciseAgeGroups', () => {
  it('contains every age group exactly once in display order', () => {
    expect(exerciseAgeGroups.map(({ ageGroup }) => ageGroup)).toEqual(
      Object.values(ExerciseAgeGroup),
    );
    expect(exerciseAgeGroups.map(({ order }) => order)).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it('provides the display name and grade range for every age group', () => {
    expect(exerciseAgeGroups).toEqual([
      expect.objectContaining({ name: 'Koala', gradeRange: '3-4' }),
      expect.objectContaining({ name: 'Medvebocs', gradeRange: '5-6' }),
      expect.objectContaining({ name: 'Kismedve', gradeRange: '7-8' }),
      expect.objectContaining({ name: 'Nagymedve', gradeRange: '9-10' }),
      expect.objectContaining({ name: 'Jegesmedve', gradeRange: '11-12' }),
    ]);
  });
});
