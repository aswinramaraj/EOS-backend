import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /lesson-plans — filters, layered on the project's shared pagination convention.
 * `unit_number` and `planned_date` are not offered — neither column exists on lesson_plans.
 */
export class ListLessonPlanQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faculty_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  class_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subject_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;
}
