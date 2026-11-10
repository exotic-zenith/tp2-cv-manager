import { IsNotEmpty, IsString } from 'class-validator';
import { VALIDATION_ERRORS } from '../../common/constants/error.messages';

export class LoginDto {
  /** On accepte indifferemment le username ou l'email. */
  @IsString({ message: VALIDATION_ERRORS.IS_STRING('identifiant') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('identifiant') })
  identifiant: string;

  @IsString({ message: VALIDATION_ERRORS.IS_STRING('password') })
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED('password') })
  password: string;
}
