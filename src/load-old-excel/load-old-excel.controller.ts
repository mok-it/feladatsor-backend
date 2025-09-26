import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoadOldExcelService } from './load-old-excel.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('load-old-excel')
export class LoadOldExcelController {
  constructor(private readonly loadOldExcelService: LoadOldExcelService) {}

  @Post('load')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 10,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.loadOldExcelService.processExcelFile(file);
  }
}
