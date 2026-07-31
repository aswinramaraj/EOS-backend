import { IsIn } from 'class-validator';

/**
 * PATCH /student-leaves/:id/faculty-approve (Faculty — the student's mentor
 * only). `decision` is an API-level concept, not a stored column: it maps to
 * student_leave_status_enum as 'rejected' → status='rejected', or
 * 'approved' → status='faculty_approved' (never a bare 'approved' — that
 * enum value doesn't exist; see schema notes in the service).
 */
export class FacultyApproveLeaveDto {
  @IsIn(['approved', 'rejected'])
  decision: 'approved' | 'rejected';
}
