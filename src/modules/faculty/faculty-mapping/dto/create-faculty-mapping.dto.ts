import { IsInt, IsString, Matches } from 'class-validator';

/**
 * POST /faculty-mapping (HoD only).
 * Maps a faculty to a subject within a class for a given academic year.
 *
 * `assigned_by_user_id` is intentionally NOT part of this DTO — the service
 * derives it from the authenticated HoD (@CurrentUser().sub), never from
 * client input.
 */
export class CreateFacultyMappingDto {
  @IsInt()
  faculty_id: number;

  @IsInt()
  subject_id: number;

  @IsInt()
  class_id: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year: string;
}
