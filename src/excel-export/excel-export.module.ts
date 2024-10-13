import { Module } from '@nestjs/common';
import { ExcelExportService } from './excel-export.service';
import { ExcelExportResolver } from './excel-export.resolver';
import { PrismaClient } from "@prisma/client";

@Module({
  providers: [ExcelExportResolver, ExcelExportService,PrismaClient],
})
export class ExcelExportModule {}
