import { Mutation, Resolver } from '@nestjs/graphql';
import { ExcelExportService } from './excel-export.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Resolver('ExcelExport')
export class ExcelExportResolver {
  constructor(private readonly excelExportService: ExcelExportService) {}

  @Mutation('exportExcel')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async exportExcel() {
    return this.excelExportService.exportExcel();
  }
}
