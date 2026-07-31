import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /student-assignment-status — Faculty (own assignments' records) /
 * Student (own records only — student_id is force-scoped in the service).
 */
export class ListStudentAssignmentStatusQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignment_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  student_id?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_submitted?: boolean;
}
