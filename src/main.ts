import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './config/config';
import { Logger } from '@nestjs/common';

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

  const { port, host } = config.server;
  logger.log(`Graphql running on http://${host}:${port}/graphql`);
  await app.listen(port, host);
}
bootstrap();
