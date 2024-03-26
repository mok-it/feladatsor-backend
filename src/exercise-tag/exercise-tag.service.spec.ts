import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseTagService } from './exercise-tag.service';

describe('ExerciseTagService', () => {
  let service: ExerciseTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExerciseTagService],
    }).compile();

    service = module.get<ExerciseTagService>(ExerciseTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
