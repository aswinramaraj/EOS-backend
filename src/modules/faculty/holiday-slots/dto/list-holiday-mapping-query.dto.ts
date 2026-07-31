import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET holiday-mapping (HR Payroll only) — filters, layered on the shared
 * pagination convention. Not used by the Faculty me/holiday-mapping route,
 * which is always implicitly scoped to the caller.
 */
export class ListHolidayMappingQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faculty_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  holiday_slot_id?: number;
}
