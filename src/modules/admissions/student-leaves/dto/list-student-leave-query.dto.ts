import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { student_leave_status_enum } from '../../../../../generated/prisma/enums';

/**
 * GET /student-leaves (Faculty only, for now) — the calling faculty's
 * mentor-review queue: every leave request from a student in a class this
 * faculty mentors (via class_mentors), across all statuses unless filtered.
 */
export class ListStudentLeaveQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(student_leave_status_enum)
  status?: student_leave_status_enum;
}
