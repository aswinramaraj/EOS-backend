import { IsIn } from 'class-validator';

/**
 * PATCH /attendance/:id (Faculty only, and only the faculty who marked it).
 *
 * `status` is the only editable field. student_id, class_id, subject_id,
 * attendance_date and marked_by_faculty_id are identity fields set at
 * creation time and are not exposed here — reassigning an attendance row
 * to a different student/class/date isn't an "edit", it's a new record.
 * Not a PartialType(CreateAttendanceDto): that DTO's shape (batch `records[]`)
 * doesn't apply to editing a single existing row.
 */
export class UpdateAttendanceDto {
  @IsIn(['present', 'absent'])
  status: 'present' | 'absent';
}
