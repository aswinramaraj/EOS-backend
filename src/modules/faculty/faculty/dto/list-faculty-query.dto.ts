import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/** GET /faculty — query filters, layered on the project's shared pagination convention. */
export class ListFacultyQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  department_id?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
