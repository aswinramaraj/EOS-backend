import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * GET /me/timetable (Student only).
 *
 * `week` has no corresponding column anywhere on timetable_slots (only
 * academic_year + semester) — its semantics are undefined per the API doc
 * ("Pending from Backend Implementation"). Accepted here so the request
 * validates, but it is never used to filter the query.
 *
 * `day` range is 1-6 (Monday-Saturday, no Sunday classes), matching this
 * module's one established day_of_week convention (see CreateTimetableDto) —
 * not 1-7; day_of_week can never actually be 7 for any real row.
 */
export class GetMyTimetableQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  day?: number;

  @IsOptional()
  @IsString()
  week?: string;
}
