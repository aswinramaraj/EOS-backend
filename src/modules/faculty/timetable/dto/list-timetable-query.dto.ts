import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /timetable — filters, layered on the project's shared pagination convention. */
export class ListTimetableQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  class_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  faculty_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subject_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  day_of_week?: number;
}
