import { IsIn } from 'class-validator';

/**
 * PATCH /student-leaves/:id/hod-approve (HoD only).
 *
 * Second (final) stage of the two-stage approval chain — only valid once
 * the mentor faculty has already set status='faculty_approved'. Same
 * decision shape as FacultyApproveLeaveDto: 'approved' -> status becomes
 * 'hod_approved' (the real terminal enum value; there is no bare
 * 'approved'), 'rejected' -> status becomes 'rejected'.
 */
export class HodApproveLeaveDto {
  @IsIn(['approved', 'rejected'])
  decision: 'approved' | 'rejected';
}
