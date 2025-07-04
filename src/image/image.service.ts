import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { Image as GraphQLImage } from '../graphql/graphqlTypes';

import * as path from 'node:path';
import { PrismaService } from '../prisma/PrismaService';
import { Config } from '../config/config';

@Injectable()
export class ImageService {
  private logger = new Logger(ImageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: Config,
  ) {}

  async saveImageFromURL(url: string) {
    const isShrepointUrl = url.includes(
      'https://mokegyesulet-my.sharepoint.com',
    );
    const img = await (
      await fetch(
        url,
        //When dealing with sharepoint urls we should use an auth cookie, yes this is a hacky solution, but it only needs to work one time
        isShrepointUrl
          ? {
              headers: {
                cookie: this.config.sharepointCookie,
              },
            }
          : undefined,
      )
    ).arrayBuffer();
    const fileName = (url.match(/^\w+:(\/+([^\/#?\s]+)){2,}/) || [])[2] || '';

    return this.processFile({
      buffer: Buffer.from(img),
      size: img.byteLength,
      originalname: fileName,
      filename: fileName,
      mimetype: '',
    } as Express.Multer.File);
  }

  async processFile(file: Express.Multer.File) {
    const image = sharp(file.buffer);

    const webpImage = await image
      .resize(this.config.fileStorage.imageProcess.resizeWidth)
      .webp({ quality: this.config.fileStorage.imageProcess.resizeQuality });

    const sharpMeta = await webpImage.metadata();
    const imageMeta = await this.storeFileMeta(file, sharpMeta);

    const imgFileName = imageMeta.id + '.webp';
    const outPath = path.join(this.config.fileStorage.imageFolder, imgFileName);

    if (!fs.existsSync(this.config.fileStorage.imageFolder)) {
      fs.mkdirSync(this.config.fileStorage.imageFolder, { recursive: true });
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

  resolveGQLImage(imageId?: string): GraphQLImage | null {
    if (!imageId) return null;
    if (imageId === 'null') return null;

    const imgFileName = imageId + '.webp';
    const imgURL = `${this.config.server.publicHost}/images/${imgFileName}`;
    return {
      id: imageId,
      url: imgURL,
    };
  }
}
