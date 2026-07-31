import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ListStudentProfilesQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  batch_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  course_id?: number;

  /** When true, only returns students that have uploaded a resume. */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  has_resume?: boolean;
}
