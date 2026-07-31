import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

/**
 * POST /lesson-plans (Faculty only).
 *
 * lesson_plans has NO faculty_mapping_id, unit_number, topic, planned_date,
 * actual_date, teaching_method, or remarks columns — schema.prisma is the
 * source of truth and none of those exist. The model stores
 * faculty_id/subject_id/class_id/semester directly (its own FKs, not a
 * reference to faculty_subject_class_mapping) plus one free-text `content`
 * field, matching workflow.md's description ("update lesson plan for the
 * entire semester (updatable)") — one evolving document per
 * faculty+subject+class+semester, not a list of dated unit entries.
 *
 * `faculty_id` is never client-supplied — the service derives it from the
 * authenticated faculty (@CurrentUser().sub), exactly like Attendance's
 * marked_by_faculty_id.
 *
 * `academic_year` has no column on lesson_plans and is never persisted — it
 * is accepted only to scope the faculty_subject_class_mapping check, which
 * IS academic_year-specific.
 */
export class CreateLessonPlanDto {
  @IsInt()
  subject_id: number;

  @IsInt()
  class_id: number;

  @IsInt()
  @Min(1)
  semester: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
