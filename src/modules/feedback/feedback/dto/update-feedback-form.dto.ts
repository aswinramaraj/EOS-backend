import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateFeedbackFormDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  class_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  batch_id?: number;
}
