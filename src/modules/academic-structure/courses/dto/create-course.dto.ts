import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCourseDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Course name, code, and department_id are required' })
  @MaxLength(255, { message: 'Course name must not exceed 255 characters' })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Course name, code, and department_id are required' })
  @MaxLength(20, { message: 'Course code must not exceed 20 characters' })
  code: string;

  @Type(() => Number)
  @IsInt({ message: 'Course name, code, and department_id are required' })
  @IsPositive({ message: 'department_id must be a positive integer' })
  department_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'duration_years must be a positive number' })
  @IsPositive({ message: 'duration_years must be a positive number' })
  @Max(10, { message: 'duration_years must not exceed 10 years' })
  duration_years?: number;
}
