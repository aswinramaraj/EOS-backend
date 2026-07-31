import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /holiday-slots — HR Payroll / Faculty (both see the same full catalog). */
export class ListHolidaySlotQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;
}
