import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * POST /holiday-slots (HR Payroll only).
 *
 * workflow.md: "vacation holiday mapping for faculties that allows the
 * faculties to choose slots" — HR Payroll defines the catalog of slots
 * (e.g. "Diwali Break") faculty later pick from via faculty_holiday_mapping.
 * from_date/to_date range order is checked in the service, not here.
 */
export class CreateHolidaySlotDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsDateString({}, { message: 'from_date must be a valid ISO date' })
  from_date: string;

  @IsDateString({}, { message: 'to_date must be a valid ISO date' })
  to_date: string;
}
