import { Injectable, Logger } from '@nestjs/common';
import { Config } from '../config/config';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/PrismaService';
import { UserService } from '../user/user.service';
import { ExerciseService } from '../exercise/exercise.service';
import {
  ExerciseAgeGroup,
  ExerciseCheckType,
  ExerciseInput,
  ExerciseStatus,
} from '../graphql/graphqlTypes';
import { Exercise, User } from '@prisma/client';
import { ImageService } from '../image/image.service';
import { ExerciseCommentService } from '../exercise-comment/exercise-comment.service';
import { ExerciseGroupService } from '../exercise-group/exercise-group.service';
import { ExerciseCheckService } from '../exercise-check/exercise-check.service';

enum XLSXHeaders {
  ID = 0,
  submitter = 1,
  koala = 2,
  bocs = 3,
  kis = 4,
  nagy = 5,
  jeges = 6,
  tags = 7,
  description = 8,
  image = 9,
  solution = 10,
  elaboration = 11,
  source = 12,
  comment = 13,
  isUsed = 13,
  isChecked = 14,
}

@Injectable()
export class LoadOldExcelService {
  private readonly logger = new Logger(LoadOldExcelService.name);

  constructor(
    private readonly config: Config,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
    private readonly exerciseCheckService: ExerciseCheckService,
    private readonly imageService: ImageService,
    private readonly commentService: ExerciseCommentService,
    private readonly exerciseGroupService: ExerciseGroupService,
  ) {}

  async processExcelFile(file: Express.Multer.File) {
    this.logger.log(`Start to process old Excel file: [${file.originalname}]`);

    const technicalUser = await this.userService.upsertTechnicalUser();
    const records: any[][] = [];

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Skip header row
        return;
      }

      const rowValues = [];
      for (let colNumber = 1; colNumber <= 14; colNumber++) {
        const cell = row.getCell(colNumber);
        rowValues.push(cell.value ? String(cell.value) : '');
      }
      records.push(rowValues);
    });

    this.logger.log('Read excel, saving to DB...');
    await this.saveExercises(records, technicalUser);
    this.logger.log('Saved exercises to DB');
  }

  private async saveExercises(records: string[][], technicalUser: User) {
    let error = 0;
    let success = 0;

    for (const record of records) {
      try {
        const sameIdExercises = await this.getAlreadySavedDuplicatedExercises(
          record,
        );
        if (sameIdExercises.length > 0) {
          this.logger.warn(
            `Found ${
              sameIdExercises.length
            } already saved exercises with same original ID: ${
              record[XLSXHeaders.ID]
            }. They will be linked in the same logic group.`,
          );
        }

        const sorted = sameIdExercises.sort((a, b) => {
          return a.id.split('-')[2].localeCompare(b.id.split('-')[2]);
        });

        const sameIdExercise =
          sorted.length > 0 ? sorted[sorted.length - 1] : undefined;

        const sameLogicGroup = sameIdExercise
          ? await this.exerciseGroupService.upsertExerciseGroupSameLogic(
              sameIdExercise.id,
              technicalUser,
            )
          : null;

        const { imgRes, failedToDownloadImage } = await this.tryToDownloadImage(
          record,
        );

        const { createdByUser, collaborators, notFoundUserNames } =
          await this.getExerciseUsersByExcelRecord(record);

        const exercise = await this.exerciseService.createExercise(
          {
            ...this.mapRecordToCreateExerciseInput(record),
            sameLogicGroup: sameLogicGroup?.id,
            exerciseImage: imgRes?.id,
            tags: await this.generateTagIds(
              this.getTags(record[XLSXHeaders.tags]),
            ),
            source: 'Imported from old excel file',
            //The id's first two chars indicate the date
            createdAt: new Date('20' + record[XLSXHeaders.ID].slice(0, 2)),
            isImported: true,
            importedAt: new Date(),
            contributors: collaborators.map((c) => c.id),
          },
          createdByUser || technicalUser,
          {
            originalId: record[XLSXHeaders.ID],
            createdAtYear: Number('20' + record[XLSXHeaders.ID].slice(0, 2)),
          },
        );

        if (notFoundUserNames.length > 0) {
          await this.commentService.createExerciseComment(
            exercise.id,
            `They also contributed to this exercise: ${notFoundUserNames.join(
              ', ',
            )}`,
            technicalUser,
          );
        }

        if (record[XLSXHeaders.isUsed].trim() != '-') {
          await this.commentService.createExerciseComment(
            exercise.id,
            `This exercise was used at: ${record[XLSXHeaders.isUsed]}`,
            technicalUser,
          );
        }

        if (
          record[XLSXHeaders.comment] &&
          record[XLSXHeaders.comment] !== '0'
        ) {
          await this.commentService.createExerciseComment(
            exercise.id,
            record[XLSXHeaders.comment],
            technicalUser,
          );
        }

        if (record[XLSXHeaders.isChecked] === 'Igen') {
          //Create 3 GOOD checks, as that means that the exercise was accepted
          await Promise.all(
            Array.from({ length: 3 }).map(() =>
              this.exerciseCheckService.createExerciseCheck(
                {
                  exerciseId: exercise.id,
                  type: ExerciseCheckType.GOOD,
                },
                technicalUser,
              ),
            ),
          );
        }

        //Failed to download, meaning it had an image, but we could not download it as an image
        if (failedToDownloadImage) {
          await this.commentService.createExerciseComment(
            exercise.id,
            `Could not download img while importing Excel, URL: ${
              record[XLSXHeaders.image]
            }`,
            technicalUser,
          );
        }
        success++;
      } catch (e) {
        this.logger.error(`Can't save record ${record[XLSXHeaders.ID]}`);
        console.log(e);
        error++;
      }
    }

    this.logger.log(`Saved: ${success}, Failed: ${error}`);

    return {
      importedCount: success,
      failedCount: error,
    };
  }

  private mapRecordToCreateExerciseInput(
    record: string[],
  ): Omit<ExerciseInput, 'tags'> {
    return {
      description: record[XLSXHeaders.description].trim(),
      helpingQuestions: record[XLSXHeaders.elaboration]
        ? [record[XLSXHeaders.elaboration]]
        : [],
      solution: record[XLSXHeaders.solution],
      solutionOptions: [],
      isCompetitionFinal: `${record[XLSXHeaders.koala]}${
        record[XLSXHeaders.bocs]
      }${record[XLSXHeaders.kis]}${record[XLSXHeaders.nagy]}${
        record[XLSXHeaders.jeges]
      }`
        .toLowerCase()
        .includes('dönt'),
      difficulty: [
        {
          ageGroup: ExerciseAgeGroup.KOALA,
          difficulty: this.difficultyToNumber(record[XLSXHeaders.koala]),
        },
        {
          ageGroup: ExerciseAgeGroup.MEDVEBOCS,
          difficulty: this.difficultyToNumber(record[XLSXHeaders.bocs]),
        },
        {
          ageGroup: ExerciseAgeGroup.KISMEDVE,
          difficulty: this.difficultyToNumber(record[XLSXHeaders.kis]),
        },
        {
          ageGroup: ExerciseAgeGroup.NAGYMEDVE,
          difficulty: this.difficultyToNumber(record[XLSXHeaders.nagy]),
        },
        {
          ageGroup: ExerciseAgeGroup.JEGESMEDVE,
          difficulty: this.difficultyToNumber(record[XLSXHeaders.jeges]),
        },
      ],
      status: ExerciseStatus.CREATED,
    };
  }

  private getTags(raw: string): string[] {
    return raw.split(',').flatMap((a) =>
      a
        .trim()
        .split(';')
        .flatMap((b) => {
          const str = b.trim();
          return str.charAt(0).toUpperCase() + str.slice(1);
        }),
    );
  }

  private difficultyToNumber(diff: string) {
    if (diff.toLowerCase().includes('dönt')) {
      return 5;
    }
    const difficulty = parseInt(diff);
    if (isNaN(difficulty)) return 0;

    return difficulty;
  }

  private async tryToDownloadImage(record: string[]) {
    let imgRes: { id: string; url: string } | undefined = undefined;
    let failedToDownloadImage = false;
    if (
      record[XLSXHeaders.image] &&
      this.isValidHttpUrl(record[XLSXHeaders.image])
    ) {
      try {
        imgRes = await this.imageService.saveImageFromURL(
          this.mapUrlToDownload(record[XLSXHeaders.image]),
        );
      } catch (e) {
        console.log(e);
        this.logger.warn(
          `Could not download image for: ${record[XLSXHeaders.ID]} URL: ${
            record[XLSXHeaders.image]
          }`,
        );
        failedToDownloadImage = true;
      }
    }
    return {
      imgRes,
      failedToDownloadImage,
    };
  }

  private isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  private mapUrlToDownload(url: string) {
    if (url.includes('https://drive.google.com/open?id=')) {
      //https://drive.usercontent.google.com/u/0/uc?id=11Vjf5IL90CoGW8gnqhohk70jZzeDxejX&export=download
      const id = new URL(url).search.split('?id=')[1];
      return `https://drive.usercontent.google.com/u/0/uc?id=${id}&export=download`;
    }
    if (url.includes('https://drive.google.com/file/d/')) {
      const id = new URL(url).pathname.split('/')[3];
      return `https://drive.usercontent.google.com/u/0/uc?id=${id}&export=download`;
    }
    return url;
  }

  private async generateTagIds(tags: string[]): Promise<string[]> {
    return (
      await Promise.all(
        tags
          .filter((t) => t !== '')
          .map((tag_name) => {
            return this.prisma.exerciseTag.upsert({
              where: {
                name: tag_name,
              },
              update: {},
              create: {
                name: tag_name,
              },
            });
          }),
      )
    ).map((tag) => tag.id);
  }

  private async getExerciseUsersByExcelRecord(record: string[]): Promise<{
    createdByUser?: User;
    collaborators: User[];
    notFoundUserNames: string[];
  }> {
    let createdByUser: User = null;
    const collaborators: User[] = [];
    const notFoundUserNames: string[] = [];

    if (record[XLSXHeaders.submitter]) {
      if (record[XLSXHeaders.submitter] !== '0') {
        const submitterNames = JSON.parse(
          record[XLSXHeaders.submitter],
        ) as string[];

        if (!Array.isArray(submitterNames)) {
          throw new Error(
            `Submitter field is not a valid JSON for ${record[XLSXHeaders.ID]}`,
          );
        }

        for (const name of submitterNames) {
          const user = await this.userService.getUserByEmail(name);
          if (!user) {
            notFoundUserNames.push(name);
          }
          if (!createdByUser) {
            createdByUser = user;
          } else {
            collaborators.push(user);
          }
        }
      }
    }

    return { createdByUser, collaborators, notFoundUserNames };
  }

  private async getAlreadySavedDuplicatedExercises(
    record: string[],
  ): Promise<Exercise[]> {
    const originalId = record[XLSXHeaders.ID];

    /*
    //Original is in the followint format: <2digit year><exercise-id><incremental_id-in group>
    //The exercise id is the same under a group

    //Cloned exercises between 2020 and 2021 are 6 digit long, and are in a format of 10*<exercise-id>+<incremental_id-in group>
    //The same is true for the ones submitted after 2022, only there they are 7 digit long
    //In some cases the cloned exercises have IDs like this 2000711 instead of 200072  (an extra 1 is added at the end)

    //If there is a K at the end, that also indicated a cloned exercise
    //One unique case where 19008521K got cloned into 1900852K
     */

    const relatedIds: string[] = [];

    // Remove K suffix if present for comparison
    const baseId = originalId.replace(/K$/, '');

    // Extract year and exercise parts
    const year = baseId.substring(0, 2);
    const yearNum = parseInt('20' + year);

    // Add the original ID itself
    relatedIds.push(originalId);

    // Handle K-suffixed variants
    if (!originalId.endsWith('K')) {
      relatedIds.push(originalId + 'K');
    } else {
      relatedIds.push(baseId);
    }

    // Special case: 19008521K -> 1900852K pattern
    if (originalId === '19008521K') {
      relatedIds.push('1900852K');
    } else if (originalId === '1900852K') {
      relatedIds.push('19008521K');
    }

    // For 2020-2021 exercises (6 digit format)
    if (yearNum >= 2020 && yearNum <= 2021 && baseId.length === 6) {
      // Format: 10*<exercise-id>+<incremental_id>
      const exerciseNum = parseInt(baseId.substring(2));
      if (!isNaN(exerciseNum)) {
        // Find the base exercise ID by dividing by 10
        const baseExerciseId = Math.floor(exerciseNum / 10);
        const incrementalId = exerciseNum % 10;

        // Generate possible related IDs
        for (let i = 0; i <= 9; i++) {
          const clonedId = year + (baseExerciseId * 10 + i);
          relatedIds.push(clonedId);
          relatedIds.push(clonedId + 'K');
        }

        // Also check for original format
        const originalFormat = year + baseExerciseId + incrementalId;
        relatedIds.push(originalFormat);
        relatedIds.push(originalFormat + 'K');
      }
    }

    // For 2022+ exercises (7 digit format)
    if (yearNum >= 2022 && baseId.length === 7) {
      // Format: 10*<exercise-id>+<incremental_id>
      const exerciseNum = parseInt(baseId.substring(2));
      if (!isNaN(exerciseNum)) {
        // Find the base exercise ID by dividing by 10
        const baseExerciseId = Math.floor(exerciseNum / 10);
        const incrementalId = exerciseNum % 10;

        // Generate possible related IDs
        for (let i = 0; i <= 9; i++) {
          const clonedId = year + (baseExerciseId * 10 + i);
          relatedIds.push(clonedId);
          relatedIds.push(clonedId + 'K');

          // Handle the extra 1 pattern (e.g., 2000711 instead of 200072)
          if (clonedId.endsWith(i.toString())) {
            const withExtra1 = clonedId.slice(0, -1) + '1' + i;
            relatedIds.push(withExtra1);
            relatedIds.push(withExtra1 + 'K');
          }
        }

        // Also check for original format
        const originalFormat = year + baseExerciseId + incrementalId;
        relatedIds.push(originalFormat);
        relatedIds.push(originalFormat + 'K');
      }
    }

    // For standard format exercises (not 6 or 7 digits)
    if (baseId.length !== 6 && baseId.length !== 7) {
      // Extract exercise ID and incremental ID
      const exerciseIdPart = baseId.substring(2, baseId.length - 1);

      if (exerciseIdPart) {
        // Generate related IDs with same exercise ID but different incremental IDs
        for (let i = 0; i <= 9; i++) {
          const relatedId = year + exerciseIdPart + i;
          relatedIds.push(relatedId);
          relatedIds.push(relatedId + 'K');
        }

        // Check for cloned format (2020-2021: 6 digits, 2022+: 7 digits)
        const exerciseIdNum = parseInt(exerciseIdPart);
        if (!isNaN(exerciseIdNum)) {
          for (let i = 0; i <= 9; i++) {
            const clonedId = year + (exerciseIdNum * 10 + i);
            relatedIds.push(clonedId);
            relatedIds.push(clonedId + 'K');
          }
        }
      }
    }

    // Remove duplicates
    const uniqueIds = [...new Set(relatedIds)];

    // Query database for exercises with any of these original IDs
    return this.prisma.exercise.findMany({
      where: {
        originalId: {
          in: uniqueIds,
        },
      },
    });
  }
}
