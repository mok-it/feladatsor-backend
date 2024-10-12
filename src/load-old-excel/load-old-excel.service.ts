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
    delimiter: ',',
  });

  constructor(
    private readonly config: Config,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
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
    let sucess = 0;

    for (const record of records) {
      try {
        const parent = await this.exerciseService.getExerciseById(
          record[CSVHeaders.ID],
        );
        await this.exerciseService.createExercise(
          {
            ...this.mapRecordToCreateExerciseInput(record),
            sameLogicParent: parent?.id,
            alternativeDifficultyParent: parent?.id,
          },
          user,
          record[CSVHeaders.ID] + (parent ? `_${faker.string.alpha(4)}` : ''),
        );
        sucess++;
      } catch (e) {
        this.logger.error(`Can't save record ${record[CSVHeaders.ID]}`);
        console.log(e);
        error++;
      }
    }

    this.logger.log(`Saved: ${sucess}, Failed: ${error}`);

    return {
      importedCount: sucess,
      failedCount: error,
    };
  }

  private mapRecordToCreateExerciseInput(record: string[]): ExerciseInput {
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
      tags: this.getTags(record[CSVHeaders.tags]),
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
}
