import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Config } from './config/config';
import { ExerciseModule } from './exercise/exercise.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ExerciseCheckModule } from './exercise-check/exercise-check.module';
import { ExerciseTagModule } from './exercise-tag/exercise-tag.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ImageModule } from './image/image.module';
import { LoadOldExcelModule } from './load-old-excel/load-old-excel.module';
import { ExerciseCommentModule } from './exercise-comment/exercise-comment.module';
import { ExerciseHistoryModule } from './exercise-history/exercise-history.module';
import { ExerciseGroupModule } from './exercise-group/exercise-group.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    Config,
    ExerciseModule,
    HealthModule,
    UserModule,
    AuthModule,
    ExerciseCheckModule,
    ExerciseTagModule,
    ImageModule,
    LoadOldExcelModule,
    ExerciseCommentModule,
    ExerciseHistoryModule,
    ExerciseGroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
