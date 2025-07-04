import { Module } from '@nestjs/common';
import { ExcelExportService } from './excel-export.service';
import { ExcelExportResolver } from './excel-export.resolver';
import { PrismaClient } from '@prisma/client';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [ExcelExportResolver, ExcelExportService, PrismaClient],
})
export class ExcelExportModule {}
