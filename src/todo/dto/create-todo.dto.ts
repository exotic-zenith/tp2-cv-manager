import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { VALIDATION_ERRORS } from '../../common/constants/error.messages';
import { StatusEnum } from '../../common/enums/status.enum';

export class CreateTodoDto {
  @IsString({ message: VALIDATION_ERRORS.IS_STRING('name') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('name') })
  @MaxLength(50, { message: VALIDATION_ERRORS.MAX_LENGTH('name', 50) })
  name: string;

  @IsString({ message: VALIDATION_ERRORS.IS_STRING('description') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('description') })
  description: string;

  @IsOptional()
  @IsEnum(StatusEnum, {
    message: `Le status doit valoir 'pending', 'in_progress' ou 'done'.`,
  })
  status?: StatusEnum;
}
