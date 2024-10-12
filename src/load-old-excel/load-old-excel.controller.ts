import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LoadOldExcelService } from './load-old-excel.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('load-old-excel')
export class LoadOldExcelController {
  constructor(private readonly loadOldExcelService: LoadOldExcelService) {}

  @Post('load')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 10,
          }),
          new FileTypeValidator({
            fileType: 'csv',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.loadOldExcelService.processExcelFile(file);
  }
}
