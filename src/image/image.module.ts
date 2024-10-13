import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Config } from '../config/config';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ImageController],
  imports: [MulterModule, Config],
  providers: [ImageService, PrismaClient],
  exports: [ImageService],
})
export class ImageModule {}
