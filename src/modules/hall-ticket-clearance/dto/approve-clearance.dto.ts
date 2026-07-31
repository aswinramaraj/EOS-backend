import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/** PATCH /hall-ticket-clearance/:id/approve (HoD only). valid_until is required. */
export class ApproveClearanceDto {
  @IsDateString({}, { message: 'valid_until must be a valid ISO date' })
  valid_until: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  letter_file_url?: string;
}
