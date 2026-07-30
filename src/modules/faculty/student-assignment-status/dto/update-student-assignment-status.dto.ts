import { IsBoolean } from 'class-validator';

/**
 * PATCH /student-assignment-status/:id (Faculty only, owner of the assignment).
 * `is_submitted` is the only editable field — assignment_id/student_id
 * identify WHICH record this is and aren't reassignable after creation.
 */
export class UpdateStudentAssignmentStatusDto {
  @IsBoolean()
  is_submitted: boolean;
}
