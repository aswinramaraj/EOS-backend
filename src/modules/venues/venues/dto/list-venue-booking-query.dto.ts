import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * GET /venue-bookings — filters, layered on the project's shared pagination
 * convention. IQAC sees every booking; every other allowed role is
 * force-scoped to their own submissions (see VenuesService.findAllBookings).
 */
export class ListVenueBookingQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'alternative_offered'])
  status?: 'pending' | 'approved' | 'rejected' | 'alternative_offered';
}
