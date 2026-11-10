import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Un seul DTO pour regrouper tous les @Query() de la recherche :
 * plus lisible et valide automatiquement par le ValidationPipe global.
 */
export class SearchCvDto {
  /** Recherche libre sur name / firstname / job. */
  @IsOptional()
  @IsString()
  critere?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(16)
  age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
