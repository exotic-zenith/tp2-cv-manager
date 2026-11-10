import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { VALIDATION_ERRORS } from '../../common/constants/error.messages';

export class CreateSkillDto {
  @IsString({ message: VALIDATION_ERRORS.IS_STRING('designation') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('designation') })
  @MaxLength(100, { message: VALIDATION_ERRORS.MAX_LENGTH('designation', 100) })
  designation: string;
}
