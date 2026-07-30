import { IsInt } from 'class-validator';

/**
 * POST me/holiday-mapping (Faculty only).
 *
 * faculty_id is never client-supplied — derived from @CurrentUser().sub,
 * same pattern as every other faculty self-service endpoint.
 */
export class CreateHolidayMappingDto {
  @IsInt()
  holiday_slot_id: number;
}
