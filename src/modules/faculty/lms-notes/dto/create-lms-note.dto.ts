import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * POST /lms-notes (Faculty only).
 *
 * lms_notes has NO faculty_mapping_id, content, unit_number, or is_published
 * columns — schema.prisma is the source of truth and none of those exist.
 * The model stores faculty_id/subject_id/class_id directly (its own FKs, not
 * a reference to faculty_subject_class_mapping), plus `title` (required) and
 * `file_url` (optional) — there is no free-text body and no draft/publish
 * state; every note is immediately visible to anyone with GET access.
 *
 * `faculty_id` is never client-supplied — the service derives it from the
 * authenticated faculty (@CurrentUser().sub), same as Attendance/Lesson Plans.
 *
 * `academic_year` has no column on lms_notes and is never persisted — it is
 * accepted only to scope the faculty_subject_class_mapping check, exactly as
 * in the Lesson Plans module.
 */
export class CreateLmsNoteDto {
  @IsInt()
  subject_id: number;

  @IsInt()
  class_id: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsUrl({}, { message: 'file_url must be a valid URL' })
  @MaxLength(500)
  file_url?: string;
}
