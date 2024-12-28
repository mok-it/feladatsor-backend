import { forwardRef, Module } from '@nestjs/common';
import { ExerciseCommentService } from './exercise-comment.service';
import { ExerciseCommentResolver } from './exercise-comment.resolver';
import { PrismaService } from '../prisma/PrismaService';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [ExerciseCommentResolver, ExerciseCommentService, PrismaService],
  exports: [ExerciseCommentService],
})
export class ExerciseCommentModule {}
