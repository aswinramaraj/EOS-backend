import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /me/exam-marks (Faculty only — own-entered records), filtered, paginated. */
export class ListExamMarksQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  exam_subject_mapping_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  student_id?: number;
}
