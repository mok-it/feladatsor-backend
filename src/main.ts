import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config/config';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { UserService } from './user/user.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors();

  const config = app.get(Config);
  if (config.jwt.disableValidation) {
    logger.error(
      'JWT token validation is disabled, only use this in development mode',
    );
  }

  app.use('/images', express.static(config.fileStorage.imageFolder, {}));
  app.use(
    '/generated',
    express.static(config.fileStorage.generatedArtifactFolder, {}),
  );

  await app.get(UserService).upsertTechnicalUser();

  const { port, host } = config.server;
  logger.log(`Graphql running on ${config.server.publicHost}/graphql`);
  logger.log(`Serving images from ${config.server.publicHost}/images`);
  logger.log(`Listening on: ${host}:${port}`);
  await app.listen(port, host);
}
bootstrap();
