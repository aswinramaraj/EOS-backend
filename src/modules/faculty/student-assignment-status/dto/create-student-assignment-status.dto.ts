import { IsBoolean, IsInt, IsOptional } from 'class-validator';

/**
 * POST /student-assignment-status (Faculty only).
 *
 * marked_by_faculty_id is never client-supplied — derived from
 * @CurrentUser().sub. The caller must own assignment_id (assignments.faculty_id)
 * and student_id must belong to that assignment's class.
 */
export class CreateStudentAssignmentStatusDto {
  @IsInt()
  assignment_id: number;

  @IsInt()
  student_id: number;

  @IsOptional()
  @IsBoolean()
  is_submitted?: boolean;
}
