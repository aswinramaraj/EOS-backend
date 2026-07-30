import { IsOptional, IsString, Matches } from 'class-validator';

/** GET /classes/:id/mentor — omit academic_year for the full assignment history. */
export class MentorQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year?: string;
}
