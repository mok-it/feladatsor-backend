import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Config } from '../config/config';
import { PrismaService } from '../prisma/PrismaService';

@Module({
  controllers: [ImageController],
  imports: [MulterModule, Config],
  providers: [ImageService, PrismaService],
  exports: [ImageService],
})
export class ImageModule {}
