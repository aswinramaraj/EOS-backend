import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /lms-notes — filters, layered on the project's shared pagination convention. */
export class ListLmsNoteQueryDto extends PaginationDto {
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
}
