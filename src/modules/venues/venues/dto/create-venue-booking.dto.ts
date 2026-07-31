import {
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * POST /venue-bookings (HoD / Faculty / Placement / IQAC).
 *
 * Only columns that actually exist on `venue_bookings` are accepted here:
 * venue_id, purpose, from_datetime, to_datetime, accommodating_strength.
 * `status` and `booked_by_user_id` are never client-supplied — status
 * always starts 'pending' and booked_by_user_id comes from
 * @CurrentUser().sub. `reviewed_by_user_id`/`alternative_venue_id` belong to
 * the (not implemented here) IQAC review step.
 */
export class CreateVenueBookingDto {
  @IsInt()
  venue_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  purpose: string;

  @IsISO8601({}, { message: 'from_datetime must be a valid ISO date-time' })
  from_datetime: string;

  @IsISO8601({}, { message: 'to_datetime must be a valid ISO date-time' })
  to_datetime: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  accommodating_strength?: number;
}
