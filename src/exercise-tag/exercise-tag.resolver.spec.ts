import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseTagResolver } from './exercise-tag.resolver';

describe('ExerciseTagResolver', () => {
  let resolver: ExerciseTagResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExerciseTagResolver],
    }).compile();

    resolver = module.get<ExerciseTagResolver>(ExerciseTagResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
