import { Module } from '@nestjs/common';
import { ExcelExportService } from './excel-export.service';
import { ExcelExportResolver } from './excel-export.resolver';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [ExcelExportResolver, ExcelExportService],
})
export class ExcelExportModule {}
