import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class UpdateRackDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  rack_code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  shelves?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject_range?: string;
}
