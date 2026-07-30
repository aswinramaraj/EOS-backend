import { IsInt } from 'class-validator';

/**
 * POST /me/exam-marks/validate (Faculty only).
 *
 * exam_marks/exam_subject_mapping have no "validated"/"locked" column in
 * schema.prisma, so this is deliberately a stateless completeness check
 * only (per explicit user direction) — it reports whether every student in
 * the class has a marks_obtained entry, and changes nothing in the
 * database. It does not lock the mapping against further edits.
 */
export class ValidateExamMarksDto {
  @IsInt()
  exam_subject_mapping_id: number;
}
