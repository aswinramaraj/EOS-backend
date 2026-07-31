import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

/**
 * PUT /me/lesson-plans (Faculty only).
 *
 * True upsert on the schema's real @@unique([faculty_id, subject_id, class_id,
 * semester]) constraint. No academic_year field — unlike POST /lesson-plans,
 * this spec doesn't call for one, and lesson_plans has no column for it
 * either way; the faculty_subject_class_mapping check matches any year.
 */
export class UpsertLessonPlanDto {
  @IsInt()
  subject_id: number;

  @IsInt()
  class_id: number;

  @IsInt()
  @Min(1)
  semester: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
