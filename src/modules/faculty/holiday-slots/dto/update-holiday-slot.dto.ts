import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/** PATCH /holiday-slots/:id (HR Payroll only). */
export class UpdateHolidaySlotDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: 'from_date must be a valid ISO date' })
  from_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to_date must be a valid ISO date' })
  to_date?: string;
}
