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
  isUsed = 14,
  isChecked = 15,
}

@Injectable()
export class LoadOldExcelService {
  private readonly logger = new Logger(LoadOldExcelService.name);
  private technicalUsers: [User, User, User];

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

    this.technicalUsers = await this.userService.upsertTechnicalUsers();
    const technicalUser = this.technicalUsers[0];
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
      for (let colNumber = 1; colNumber <= 16; colNumber++) {
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

    const exerciseIds = records.map((record) => record[XLSXHeaders.ID]);
    const exerciseGroups = this.matchExerciseGroups(exerciseIds);

    // Create a map to store created exercises and their group IDs
    const createdExercises = new Map<
      string,
      { exercise: Exercise; groupId?: string }
    >();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        const currentId = record[XLSXHeaders.ID];

        // Find which group this exercise belongs to
        const currentGroup = exerciseGroups.find((group) =>
          group.includes(currentId),
        );

        // Determine if we need to create or use a group
        let sameLogicGroup = null;
        let someGroupMemberId = null;

        if (currentGroup && currentGroup.length > 1) {
          // Find if any exercise in this group has already been created
          const existingGroupMember = currentGroup.find((id) =>
            createdExercises.has(id),
          );

          if (existingGroupMember) {
            // Use the existing group ID
            const existingData = createdExercises.get(existingGroupMember);
            sameLogicGroup = existingData?.groupId;
            someGroupMemberId =
              createdExercises.get(existingGroupMember).exercise.id;
          }
        }

        const { imgRes, failedToDownloadImage } = await this.tryToDownloadImage(
          record,
        );

        const { createdByUser, contributors, notFoundUserNames } =
          await this.getExerciseUsersByExcelRecord(record);

        const exercise = await this.exerciseService.createExercise(
          {
            ...this.mapRecordToCreateExerciseInput(record),
            status:
              record[XLSXHeaders.isChecked] === 'Igen'
                ? ExerciseStatus.APPROVED
                : ExerciseStatus.CREATED,
            sameLogicGroup: sameLogicGroup,
            exerciseImage: imgRes?.id,
            tags: await this.generateTagIds(
              this.getTags(record[XLSXHeaders.tags]),
            ),
            source: record[XLSXHeaders.source],
            //The id's first two chars indicate the date
            createdAt: new Date('20' + record[XLSXHeaders.ID].slice(0, 2)),
            isImported: true,
            importedAt: new Date(),
            contributors: contributors.map((c) => c.id),
          },
          createdByUser || technicalUser,
          {
            originalId: record[XLSXHeaders.ID],
            createdAtYear: Number('20' + record[XLSXHeaders.ID].slice(0, 2)),
            id: someGroupMemberId
              ? await this.exerciseService.generateNextIdInGroup(
                  someGroupMemberId,
                )
              : undefined,
          },
        );

        // If this is the first exercise in a group, create the group
        if (currentGroup && currentGroup.length > 1 && !sameLogicGroup) {
          const group =
            await this.exerciseGroupService.upsertExerciseGroupSameLogic(
              exercise.id,
              technicalUser,
            );
          sameLogicGroup = group.id;
        }

        // Store the created exercise with its group ID
        createdExercises.set(currentId, { exercise, groupId: sameLogicGroup });

        if (notFoundUserNames.length > 0) {
          await this.commentService.createExerciseComment(
            exercise.id,
            `Ők is dolgozatak a feladaton:\n ${notFoundUserNames.join('\n')}`,
            technicalUser,
          );
        }

        if (
          record[XLSXHeaders.isUsed].trim() &&
          record[XLSXHeaders.isUsed].trim() != '-'
        ) {
          await this.commentService.createExerciseComment(
            exercise.id,
            `Ez a feladat már volt használva itt: ${
              record[XLSXHeaders.isUsed]
            }`,
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
            this.technicalUsers.map((tUser) =>
              this.exerciseCheckService.createExerciseCheck(
                {
                  exerciseId: exercise.id,
                  type: ExerciseCheckType.GOOD,
                },
                tUser,
              ),
            ),
          );
          //Force do the aggregation, the above promise might have race conditions
          await this.exerciseCheckService.doExerciseCheckAggregation(
            exercise.id,
          );
        }

        //Failed to download, meaning it had an image, but we could not download it as an image
        if (failedToDownloadImage) {
          await this.commentService.createExerciseComment(
            exercise.id,
            `Nem sikerült letölteni a feladat képét, URL: ${
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
      solveIdea: record[XLSXHeaders.elaboration].trim(),
      helpingQuestions: [],
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

  private isValidHttpUrl(string: string) {
    let url: URL;

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
    contributors: User[];
    notFoundUserNames: string[];
  }> {
    let createdByUser: User = null;
    const contributors: User[] = [];
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
          } else {
            if (!createdByUser) {
              createdByUser = user;
            } else {
              contributors.push(user);
            }
          }
        }
      }
    }

    return { createdByUser, contributors, notFoundUserNames };
  }

  private matchExerciseGroups(exerciseIds: string[]) {
    /*
    Original is in the followint format: <2digit year><exercise-id><incremental_id-in group>
    The exercise id is the same under a group

    Cloned exercises between 2020 and 2021 are 6 digit long, and are in a format of 10*<exercise-id>+<incremental_id-in group>
    The same is true for the ones submitted after 2022, only there they are 7 digit long
    In some cases the cloned exercises have IDs like this 2000711 instead of 200072  (an extra 1 is added at the end)

    If there is a K at the end, that also indicated a cloned exercise
    One unique case where 19008521K got cloned into 1900852K
     */

    const compareIds = (a: string, b: string) => {
      if (a === '19008521K' && b === '1900852K') return true;
      if (a === '1900852K' && b === '19008521K') return true;

      const yearA = a.slice(0, 2); //20, 21, 22, 23, etc
      const yearB = b.slice(0, 2);
      if (yearA !== yearB) return false;

      const aCore = a.endsWith('K') ? a.slice(2, -1) : a.slice(2);
      const bCore = b.endsWith('K') ? b.slice(2, -1) : b.slice(2);

      if (
        ['19', '20', '20', '21'].includes(yearA) ||
        ['19', '20', '20', '21'].includes(yearB)
      ) {
        if (aCore.slice(0, 3) === bCore.slice(0, 3)) {
          return true;
        }
      } else {
        if (aCore.slice(0, 4) === bCore.slice(0, 4)) {
          return true;
        }
      }

      return false;
    };

    // Create groups using Union-Find algorithm
    const groups: string[][] = [];
    const idToGroupIndex = new Map<string, number>();

    for (let i = 0; i < exerciseIds.length; i++) {
      const currentId = exerciseIds[i];
      let foundGroup = false;

      // Check if this ID matches any ID in existing groups
      for (let j = 0; j < i; j++) {
        const previousId = exerciseIds[j];

        if (compareIds(currentId, previousId)) {
          const groupIndex = idToGroupIndex.get(previousId);
          if (groupIndex !== undefined) {
            groups[groupIndex].push(currentId);
            idToGroupIndex.set(currentId, groupIndex);
            foundGroup = true;
            break;
          }
        }
      }

      // If no matching group found, create a new group
      if (!foundGroup) {
        const newGroupIndex = groups.length;
        groups.push([currentId]);
        idToGroupIndex.set(currentId, newGroupIndex);
      }
    }

    return groups;
  }
}
