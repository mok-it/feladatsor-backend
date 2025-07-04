import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ExcelExportService } from './excel-export.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.auth.decorator';
import { ExcelExport } from '@prisma/client';

@Resolver('ExportResult')
export class ExcelExportResolver {
  constructor(private readonly excelExportService: ExcelExportService) {}

  @Mutation('exportExcel')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async exportExcel(@CurrentUser() user: any) {
    return this.excelExportService.exportExcel(user.id);
  }

  @Query('listExcelExports')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async listExcelExports() {
    return this.excelExportService.listExports();
  }

  @Mutation('deleteExcelExport')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deleteExcelExport(@Args('exportId') exportId: string) {
    return this.excelExportService.deleteExport(exportId);
  }

  @ResolveField('url')
  async resolveUrl(@Parent() exportData: ExcelExport) {
    return this.excelExportService.getExportUrl(exportData);
  }
}
