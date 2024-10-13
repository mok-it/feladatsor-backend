import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';
import { Config } from '../config/config';
import * as fs from 'fs';
import * as path from 'node:path';

@Injectable()
export class ExcelExportService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly config: Config,
  ) {}

  async exportExcel(): Promise<{ url: string }> {
    const workbook = new ExcelJS.Workbook();
    let tableNames = (await this.prismaClient
      .$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  `) as { table_name: string }[];

    //delete the prisma migrations table
    tableNames = tableNames.filter((tableName) => {
      return tableName.table_name != '_prisma_migrations';
    });

    await Promise.all(
      tableNames.map(async (tableName) => {
        const data = await this.prismaClient[tableName.table_name].findMany({});

        if (tableName.table_name === 'User') {
          for (const i in data) {
            delete data[i].password;
          }
        }
        const worksheet = workbook.addWorksheet(tableName.table_name);
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          worksheet.columns = columns.map((col) => ({ header: col, key: col }));
          data.forEach((row: any) => {
            worksheet.addRow(row);
          });
        }
      }),
    );

    const excelFileName = Date.now().toString() + '.xlsx';
    const outPath = path.join(
      this.config.fileStorage.generatedArtifactFolder,
      excelFileName,
    );

    if (!fs.existsSync(this.config.fileStorage.generatedArtifactFolder)) {
      fs.mkdirSync(this.config.fileStorage.generatedArtifactFolder, {
        recursive: true,
      });
    }

    await workbook.xlsx.writeFile(outPath);

    const fileURL = `${this.config.server.publicHost}/generated/${excelFileName}`;

    return {
      url: fileURL,
    };
  }
}
