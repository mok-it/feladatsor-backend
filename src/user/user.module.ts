import { forwardRef, Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { ExerciseModule } from '../exercise/exercise.module';
import { ImageModule } from '../image/image.module';
import { PrismaService } from '../prisma/PrismaService';
import { StatModule } from '../stat/stat.module';

@Module({
  imports: [forwardRef(() => ExerciseModule), StatModule, ImageModule],
  providers: [
    UserResolver,
    UserService,
    PrismaService,
    {
      provide: Logger,
      useFactory: () => new Logger(UserService.name),
    },
  ],
  exports: [UserService],
})
export class UserModule {}
