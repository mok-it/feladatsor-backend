import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ExcelExport, PrismaClient } from '@prisma/client';
import { Config } from '../config/config';
import * as fs from 'fs';
import * as path from 'node:path';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

@Injectable()
export class ExcelExportService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly config: Config,
  ) {}

  async exportExcel(userId: string) {
    const workbook = new ExcelJS.Workbook();
    let tableNames = (await this.prismaClient
      .$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  `) as { table_name: string }[];

    //delete the prisma migrations table
    tableNames = tableNames.filter((tableName) => {
      return tableName.table_name !== '_prisma_migrations';
    });

    await Promise.all(
      tableNames.map(async ({ table_name }) => {
        const data = (await this.prismaClient.$queryRawUnsafe(
          `SELECT * FROM "public"."${table_name}"`,
        )) as any[];

        if (table_name === 'User') {
          for (const i in data) {
            delete data[i].password;
          }
        }
        const worksheet = workbook.addWorksheet(table_name);
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          worksheet.columns = columns.map((col) => ({ header: col, key: col }));
          data.forEach((row: any) => {
            try {
              worksheet.addRow(row);
            } catch (e) {
              console.log(e);
            }
          });

          worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column['eachCell']({ includeEmpty: true }, function (cell) {
              const columnLength = cell.value
                ? cell.value.toString().length
                : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width =
              maxLength > 500 ? 500 : maxLength < 10 ? 10 : maxLength;
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

    // Get file stats for database record
    const stats = fs.statSync(outPath);

    // Save export record to database
    return this.prismaClient.excelExport.create({
      data: {
        fileName: excelFileName,
        fileSize: BigInt(stats.size),
        filePath: outPath,
        exportedById: userId,
      },
    });
  }

  async listExports() {
    const exports = await this.prismaClient.excelExport.findMany({
      include: {
        exportedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return exports.map((exp) => ({
      ...exp,
      fileSize: exp.fileSize.toString(),
    }));
  }

  async deleteExport(exportId: string) {
    return await this.prismaClient.$transaction(async (prisma) => {
      const exportRecord = await prisma.excelExport.findUnique({
        where: { id: exportId },
      });

      if (!exportRecord) {
        throw new Error('Export not found');
      }

      // Delete the record from database first
      await prisma.excelExport.delete({
        where: { id: exportId },
      });

      // Delete the file from filesystem
      if (fs.existsSync(exportRecord.filePath)) {
        fs.unlinkSync(exportRecord.filePath);
      }

      return { success: true };
    });
  }

  getExportUrl(file: ExcelExport) {
    return `${this.config.server.publicHost}/${file.filePath}`;
  }
}
