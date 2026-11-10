import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VALIDATION_ERRORS } from '../../common/constants/error.messages';

export class CreateCvDto {
  @IsString({ message: VALIDATION_ERRORS.IS_STRING('name') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('name') })
  @MaxLength(100, { message: VALIDATION_ERRORS.MAX_LENGTH('name', 100) })
  name: string;

  @IsString({ message: VALIDATION_ERRORS.IS_STRING('firstname') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('firstname') })
  @MaxLength(100, { message: VALIDATION_ERRORS.MAX_LENGTH('firstname', 100) })
  firstname: string;

  @Type(() => Number)
  @IsInt({ message: VALIDATION_ERRORS.IS_NUMBER('age') })
  @Min(16, { message: "L'age doit etre superieur ou egal a 16." })
  @Max(99, { message: "L'age doit etre inferieur ou egal a 99." })
  age: number;

  @IsString({ message: VALIDATION_ERRORS.IS_STRING('cin') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('cin') })
  @MaxLength(20, { message: VALIDATION_ERRORS.MAX_LENGTH('cin', 20) })
  cin: string;

  @IsString({ message: VALIDATION_ERRORS.IS_STRING('job') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('job') })
  @MaxLength(100, { message: VALIDATION_ERRORS.MAX_LENGTH('job', 100) })
  job: string;

  @IsOptional()
  @IsString({ message: VALIDATION_ERRORS.IS_STRING('path') })
  path?: string;

  /** Liste d'ids de competences a rattacher au cv. */
  @IsOptional()
  @IsArray({ message: 'skillIds doit etre un tableau d ids.' })
  @IsInt({ each: true, message: 'Chaque skillId doit etre un entier.' })
  @Type(() => Number)
  skillIds?: number[];
}
