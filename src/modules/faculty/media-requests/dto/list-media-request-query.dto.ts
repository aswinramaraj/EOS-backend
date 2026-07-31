import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /media-requests — filters, layered on the project's shared pagination
 * convention. Faculty is always force-scoped to their own requests
 * regardless of this filter (see MediaRequestsService.findAll).
 */
export class ListMediaRequestQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'delivered'])
  status?: 'pending' | 'approved' | 'rejected' | 'delivered';
}
