import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /payslip-requests — filters, layered on the project's shared
 * pagination convention. `faculty_id` is only honored for HR Payroll
 * callers — a FACULTY caller is always force-scoped to their own records.
 */
export class ListPayslipRequestQueryDto extends PaginationDto {
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

  @IsOptional()
  @IsIn(['pending', 'processed', 'rejected'])
  status?: 'pending' | 'processed' | 'rejected';
}
