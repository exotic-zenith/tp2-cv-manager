import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { VALIDATION_ERRORS } from '../../common/constants/error.messages';

export class CreateUserDto {
  @IsString({ message: VALIDATION_ERRORS.IS_STRING('username') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('username') })
  @MinLength(3, { message: VALIDATION_ERRORS.MIN_LENGTH('username', 3) })
  @MaxLength(50, { message: VALIDATION_ERRORS.MAX_LENGTH('username', 50) })
  username: string;

  @IsEmail({}, { message: VALIDATION_ERRORS.IS_EMAIL })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('email') })
  email: string;

  @IsString({ message: VALIDATION_ERRORS.IS_STRING('password') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('password') })
  @MinLength(6, { message: VALIDATION_ERRORS.MIN_LENGTH('password', 6) })
  password: string;
}
