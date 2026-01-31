import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseSheetCommentService } from './exercise-sheet-comment.service';
import { PrismaService } from '../prisma/PrismaService';
import { User, Role } from '@prisma/client';

const mockPrismaService = {
  exerciseSheetComment: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  userName: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  firebaseId: 'firebase-id',
  roles: [Role.USER, Role.PROOFREAD_EXERCISE_SHEET],
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarUrl: null,
  customAvatarId: null,
};

describe('ExerciseSheetCommentService', () => {
  let service: ExerciseSheetCommentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSheetCommentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExerciseSheetCommentService>(
      ExerciseSheetCommentService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment on a sheet', async () => {
      const input = {
        comment: 'Test comment',
        exerciseSheetId: 'sheet-1',
        exerciseSheetItemId: null,
        exerciseOnExerciseSheetItemId: null,
      };

      const expectedResult = { id: 'comment-1', ...input, userId: mockUser.id };
      mockPrismaService.exerciseSheetComment.create.mockResolvedValue(
        expectedResult,
      );

      const result = await service.create(input, mockUser);

      expect(prisma.exerciseSheetComment.create).toHaveBeenCalledWith({
        data: {
          comment: input.comment,
          user: { connect: { id: mockUser.id } },
          exerciseSheet: { connect: { id: 'sheet-1' } },
          exerciseSheetItem: undefined,
          exerciseOnExerciseSheetItem: undefined,
          contributors: undefined,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('resolve', () => {
    it('should resolve a comment', async () => {
      const commentId = 'comment-1';
      const notes = 'Fixed it';

      const expectedResult = {
        id: commentId,
        isResolved: true,
        resolvedById: mockUser.id,
        resolutionNotes: notes,
      };

      mockPrismaService.exerciseSheetComment.update.mockResolvedValue(
        expectedResult,
      );

      const result = await service.resolveSheetComment(
        commentId,
        notes,
        mockUser,
      );

      expect(prisma.exerciseSheetComment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: {
          isResolved: true,
          resolvedAt: expect.any(Date),
          resolvedById: mockUser.id,
          resolutionNotes: notes,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('fetching comments', () => {
    it('should fetch comments for a sheet', async () => {
      const sheetId = 'sheet-1';
      const expectedComments = [{ id: 'c1', exerciseSheetId: sheetId }];

      mockPrismaService.exerciseSheetComment.findMany.mockResolvedValue(
        expectedComments,
      );

      const result = await service.getCommentsForSheet(sheetId);

      expect(prisma.exerciseSheetComment.findMany).toHaveBeenCalledWith({
        where: { exerciseSheetId: sheetId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedComments);
    });
  });
});
