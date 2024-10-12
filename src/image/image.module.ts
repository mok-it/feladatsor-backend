import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/PrismaService';
import { Config } from '../config/config';

@Module({
  controllers: [ImageController],
  imports: [MulterModule, Config],
  providers: [ImageService, PrismaService],
})
export class ImageModule {}
