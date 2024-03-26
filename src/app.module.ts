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

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
    }),
    Config,
    ExerciseModule,
    HealthModule,
    UserModule,
    AuthModule,
    ExerciseCheckModule,
    ExerciseTagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
