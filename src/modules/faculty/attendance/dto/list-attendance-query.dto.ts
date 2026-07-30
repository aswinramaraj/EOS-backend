import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /attendance — filters, layered on the project's shared pagination convention. */
export class ListAttendanceQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  class_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  student_id?: number;

  @IsOptional()
  @IsDateString({}, { message: 'date must be a valid ISO date' })
  date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'from_date must be a valid ISO date' })
  from_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to_date must be a valid ISO date' })
  to_date?: string;
}
