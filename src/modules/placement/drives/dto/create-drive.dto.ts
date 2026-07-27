import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateDriveDto {
  @IsInt()
  @IsPositive()
  company_id: number;

  @IsDateString()
  scheduled_date: string;

  /** Defaults to true (schema default) — the company name is visible to students immediately. */
  @IsOptional()
  @IsBoolean()
  is_disclosed?: boolean;

  /** Required when is_disclosed is false — the date the company name becomes visible to students. */
  @IsOptional()
  @IsDateString()
  disclosed_reveal_date?: string;
}
