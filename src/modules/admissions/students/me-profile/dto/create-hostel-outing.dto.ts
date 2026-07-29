import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * from_date/to_date are checked here only for "present and a valid date
 * string" — the business rule (not in the past, from_date <= to_date) is
 * checked in MeHostelOutingsService as 422 INVALID_DATE_RANGE, matching the
 * DTO/service split used by CreateLeaveDto/CreateOdRequestDto.
 *
 * return_time/reason use plain @IsOptional() (not @ValidateIf) because this
 * is a create, not an update — an explicit `null` and an omitted field both
 * just mean "not provided", persisting the same NULL either way. There is
 * no prior value a null could silently wipe (see UpdateProfileDto's
 * @ValidateIf fix for why that distinction matters on an update endpoint).
 */
export class CreateHostelOutingDto {
  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;

  @Matches(TIME_PATTERN, { message: 'start_time must be a valid HH:MM time' })
  start_time: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'return_time must be a valid HH:MM time' })
  return_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
