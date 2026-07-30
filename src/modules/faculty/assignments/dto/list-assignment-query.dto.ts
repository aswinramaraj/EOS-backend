import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /assignments (Faculty only — own records), filtered, paginated. */
export class ListAssignmentQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  class_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subject_id?: number;

  @IsOptional()
  @IsString()
  academic_year?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;
}
