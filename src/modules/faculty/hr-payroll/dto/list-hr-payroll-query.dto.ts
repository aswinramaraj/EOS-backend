import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /hr-payroll — filters, layered on the project's shared pagination
 * convention. `faculty_id` is only honored for HR Payroll callers — a
 * FACULTY caller is always force-scoped to their own records (see
 * HrPayrollService.findAll).
 */
export class ListHrPayrollQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faculty_id?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in the format YYYY-MM',
  })
  month?: string;
}
