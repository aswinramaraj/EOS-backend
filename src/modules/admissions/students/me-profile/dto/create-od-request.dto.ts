import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * from_date/to_date are checked here only for "present and a valid date
 * string" (400 VALIDATION_ERROR territory). The business rule — not in the
 * past, from_date <= to_date — is checked in MeOdTeamsService as 422
 * INVALID_DATE_RANGE (a distinct errorCode the global ValidationPipe can't
 * produce), matching the DTO/service split used by CreateLeaveDto.
 *
 * `reason` uses plain @IsOptional() (not @ValidateIf, unlike
 * UpdateProfileDto's fields) because this is a create — an explicit `null`
 * and an omitted field both just mean "no reason", persisting the same
 * NULL either way. There is no prior value a null could silently wipe, so
 * the null-bypass concern that motivated @ValidateIf on the profile DTO
 * doesn't apply here.
 */
export class CreateOdRequestDto {
  @IsDateString()
  from_date: string;

  @IsDateString()
  to_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
