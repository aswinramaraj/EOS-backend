import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

/**
 * from/to are checked here only for "present and a valid date string" —
 * the from <= to business rule is checked in MeAttendanceService (422 would
 * overstate it; the spec's own example is a plain 400 VALIDATION_ERROR with
 * a custom message, so that check lives in the service to produce that exact
 * message rather than a generic class-validator one).
 */
export class GetAttendanceDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subject_id?: number;
}
