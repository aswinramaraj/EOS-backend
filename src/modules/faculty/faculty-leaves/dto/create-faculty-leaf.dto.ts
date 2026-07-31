import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * POST /faculty-leaves (Faculty only).
 *
 * faculty_leaves has NO leave_type or document_url columns — schema.prisma is
 * the source of truth and neither exists. The model only stores
 * from_date/to_date/reason plus the two independent approval-status enums.
 *
 * `faculty_id` is never client-supplied, even though the spec's example body
 * includes it — the service derives it from the authenticated faculty
 * (@CurrentUser().sub), same pattern as Attendance/Lesson Plans/LMS Notes,
 * and consistent with "Faculty: POST ... own" in the RBAC section (this is
 * self-service leave application, not applying on someone else's behalf).
 */
export class CreateFacultyLeafDto {
  @IsDateString({}, { message: 'from_date must be a valid ISO date' })
  from_date: string;

  @IsDateString({}, { message: 'to_date must be a valid ISO date' })
  to_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
