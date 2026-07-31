import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ListCompaniesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
