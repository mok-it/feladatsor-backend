import { Injectable, Logger } from '@nestjs/common';
import { Config } from 'src/config/config';
import { parse, Parser } from 'csv-parse';
import { Readable } from 'node:stream';
import { PrismaService } from '../prisma/PrismaService';
import { UserService } from '../user/user.service';
import { ExerciseService } from '../exercise/exercise.service';
import {
  ExerciseAgeGroup,
  ExerciseInput,
  ExerciseStatus,
} from '../graphql/graphqlTypes';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ImageService } from '../image/image.service';
import { ExerciseCommentService } from '../exercise-comment/exercise-comment.service';
import { ExerciseGroupService } from '../exercise-group/exercise-group.service';

enum CSVHeaders {
  ID,
  koala,
  bocs,
  kis,
  nagy,
  jeges,
  tags,
  description,
  image,
  solution,
  elaboration,
  comment,
  isUsed,
  helpingQuestions,
  solutionOption1,
  solutionOption2,
  solutionOption3,
  creatorComment,
  newTextIdea,
}

@Injectable()
export class LoadOldExcelService {
  private readonly logger = new Logger(LoadOldExcelService.name);
  private parser: Parser = parse({
    delimiter: ';',
  });

  constructor(
    private readonly config: Config,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
    private readonly imageService: ImageService,
    private readonly commentService: ExerciseCommentService,
    private readonly exerciseGroupService: ExerciseGroupService,
  ) {}

  async processExcelFile(file: Express.Multer.File) {
    this.logger.log(`Start to process old Excel file: [${file.originalname}]`);

    const user = await this.userService.getFirstUser();
    const records: string[][] = [];

    // Use the readable stream api to consume records
    this.parser.on('readable', async () => {
      let record;
      while ((record = this.parser.read()) !== null) {
        records.push(record);
      }
    });

    this.parser.on('error', (err) => {
      this.logger.error(err.message);
    });

    this.parser.on('end', async () => {
      this.logger.log('Read excel, saving to DB...');
      await this.saveExercises(records, user);
      this.logger.log('Saved exercises to DB');
    });

    Readable.from(file.buffer).pipe(this.parser);
  }

  private async saveExercises(records: string[][], user: User) {
    let error = 0;
    let success = 0;

    for (const record of records) {
      try {
        const sameIdExercise = await this.exerciseService.getExerciseById(
          record[CSVHeaders.ID],
        );

        const alternativeDifficultyGroup = sameIdExercise
          ? await this.exerciseGroupService.upsertExerciseGroupAlternativeDifficulty(
              sameIdExercise.id,
              user,
            )
          : null;

        const sameLogicGroup = sameIdExercise
          ? await this.exerciseGroupService.upsertExerciseGroupSameLogic(
              sameIdExercise.id,
              user,
            )
          : null;

        const { imgRes, failedToDownloadImage } = await this.tryToDownloadImage(
          record,
        );
        const tagIDs = await this.generateTagIds(
          this.getTags(record[CSVHeaders.tags]),
        );

        const exercise = await this.exerciseService.createExercise(
          {
            ...this.mapRecordToCreateExerciseInput(record),
            sameLogicGroup: sameLogicGroup?.id,
            alternativeDifficultyGroup: alternativeDifficultyGroup?.id,
            exerciseImage: imgRes?.id,
            tags: tagIDs,
          },
          user,
          record[CSVHeaders.ID] +
            (sameIdExercise ? `_${faker.string.alpha(4)}` : ''),
        );
        if (failedToDownloadImage) {
          await this.commentService.createExerciseComment(
            exercise.id,
            `Could not download img while importing Excel, URL: ${
              record[CSVHeaders.image]
            }`,
            user,
          );
        }
        success++;
      } catch (e) {
        this.logger.error(`Can't save record ${record[CSVHeaders.ID]}`);
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
      description: record[CSVHeaders.description].trim(),
      helpingQuestions: [record[CSVHeaders.helpingQuestions]],
      solution: record[CSVHeaders.solution],
      solutionOptions: [
        record[CSVHeaders.solutionOption1],
        record[CSVHeaders.solutionOption2],
        record[CSVHeaders.solutionOption3],
      ],
      isCompetitionFinal: (
        record[CSVHeaders.koala] +
        record[CSVHeaders.bocs] +
        record[CSVHeaders.kis] +
        record[CSVHeaders.nagy] +
        record[CSVHeaders.jeges]
      ).includes('dönt'),
      difficulty: [
        {
          ageGroup: ExerciseAgeGroup.KOALA,
          difficulty: this.difficultyToNumber(record[CSVHeaders.koala]),
        },
        {
          ageGroup: ExerciseAgeGroup.MEDVEBOCS,
          difficulty: this.difficultyToNumber(record[CSVHeaders.bocs]),
        },
        {
          ageGroup: ExerciseAgeGroup.KISMEDVE,
          difficulty: this.difficultyToNumber(record[CSVHeaders.kis]),
        },
        {
          ageGroup: ExerciseAgeGroup.NAGYMEDVE,
          difficulty: this.difficultyToNumber(record[CSVHeaders.nagy]),
        },
        {
          ageGroup: ExerciseAgeGroup.JEGESMEDVE,
          difficulty: this.difficultyToNumber(record[CSVHeaders.jeges]),
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
      record[CSVHeaders.image] &&
      this.isValidHttpUrl(record[CSVHeaders.image])
    ) {
      try {
        imgRes = await this.imageService.saveImageFromURL(
          this.mapUrlToDownload(record[CSVHeaders.image]),
        );
      } catch (e) {
        console.log(e);
        this.logger.warn(
          `Could not download image for: ${record[CSVHeaders.ID]} URL: ${
            record[CSVHeaders.image]
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
        tags.map((tag_name) => {
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
}
