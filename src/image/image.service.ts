import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/PrismaService';
import * as sharp from 'sharp';
import { Config } from 'src/config/config';
import * as fs from 'fs';
const path = require('node:path');

@Injectable()
export class ImageService {
  private logger = new Logger(ImageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  async processFile(file: Express.Multer.File) {
    const image = sharp(file.buffer);

    const webpImage = await image
      .resize(this.config.fileStorage.imageProcess.resizeWidth)
      .webp({ quality: this.config.fileStorage.imageProcess.resizeQuality });

    const sharpMeta = await webpImage.metadata();
    const imageMeta = await this.storeFileMeta(file, sharpMeta);

    const imgFileName = imageMeta.id + '.webp';
    const outPath = path.join(this.config.fileStorage.saveFolder, imgFileName);

    if (!fs.existsSync(this.config.fileStorage.saveFolder)) {
      fs.mkdirSync(this.config.fileStorage.saveFolder, { recursive: true });
    }

    await webpImage.toFile(outPath);

    const imgURL = `${this.config.server.publicHost}/images/${imgFileName}`;

    return {
      id: imageMeta.id,
      transformedSize: Number(imageMeta.transformedSize),
      url: imgURL,
    };
  }

  private async storeFileMeta(
    file: Express.Multer.File,
    sharpMeta: sharp.Metadata,
  ) {
    const savedImageMeta = await this.prisma.image.create({
      data: {
        originalMimeType: file.mimetype,
        originalName: file.originalname,
        originalSize: file.size,
        transformedSize: sharpMeta.size,
      },
    });
    this.logger.log(
      `New file uploaded, Name: [${file.originalname}] Stored as: [${savedImageMeta.id}]`,
    );

    return savedImageMeta;
  }
}
