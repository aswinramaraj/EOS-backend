import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum ReportFormat {
  json = 'json',
  excel = 'excel',
  pdf = 'pdf',
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.json;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
