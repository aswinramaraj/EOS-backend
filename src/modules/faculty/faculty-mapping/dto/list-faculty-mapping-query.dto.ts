import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /faculty-mapping — optional filters, layered on the project's shared pagination convention. */
export class ListFacultyMappingQueryDto extends PaginationDto {
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
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year?: string;
}
