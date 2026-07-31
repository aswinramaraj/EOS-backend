import { IsIn, IsInt, IsString, Matches, Min } from 'class-validator';

/** HH:mm or HH:mm:ss, 24-hour. Matches how timetable_slots.start_time/end_time (@db.Time) are stored. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/**
 * POST /timetable (HoD only).
 *
 * `day_of_week` is a plain SmallInt in the schema — there is no enum or
 * comment defining what the integers mean. This module adopts 1=Monday..
 * 6=Saturday (no Sunday classes), matching workflow.md/docs' Mon-Sat listing,
 * but this is a convention this module defines, not something schema.prisma states.
 */
export class CreateTimetableDto {
  @IsInt()
  class_id: number;

  @IsInt()
  subject_id: number;

  @IsInt()
  faculty_id: number;

  @IsInt()
  @Min(1)
  @IsIn([1, 2, 3, 4, 5, 6], {
    message: 'day_of_week must be 1 (Monday) through 6 (Saturday)',
  })
  day_of_week: number;

  @IsInt()
  @Min(1)
  period_number: number;

  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'start_time must be in HH:mm or HH:mm:ss (24-hour) format',
  })
  start_time: string;

  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'end_time must be in HH:mm or HH:mm:ss (24-hour) format',
  })
  end_time: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year: string;

  @IsInt()
  @Min(1)
  semester: number;
}
