import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaClient } from '@prisma/client';
import { ExerciseModule } from '../exercise/exercise.module';

@Module({
  imports: [ExerciseModule],
  providers: [UserResolver, UserService, PrismaClient, {
    provide: Logger,
    useFactory: () => new Logger(UserService.name)
  }],
  exports: [UserService],
})
export class UserModule {}
