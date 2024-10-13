import { Mutation, Resolver } from '@nestjs/graphql';
import { ExcelExportService } from './excel-export.service';

@Resolver('ExcelExport')
export class ExcelExportResolver {
  constructor(private readonly excelExportService: ExcelExportService) {}

  @Mutation('exportExcel')
  async exportExcel() {
    return this.excelExportService.exportExcel();
  }
}
