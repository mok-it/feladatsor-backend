import { forwardRef, Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaClient } from '@prisma/client';
import { ExerciseModule } from '../exercise/exercise.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [forwardRef(() => ExerciseModule), ImageModule],
  providers: [
    UserResolver,
    UserService,
    PrismaClient,
    {
      provide: Logger,
      useFactory: () => new Logger(UserService.name),
    },
  ],
  exports: [UserService],
})
export class UserModule {}
