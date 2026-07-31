import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /salary-divisions — filters, layered on the project's shared
 * pagination convention. `faculty_id` is only honored for HR Payroll
 * callers — a FACULTY caller is always force-scoped to their own records.
 */
export class ListSalaryDivisionQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faculty_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  division_name?: string;
}
