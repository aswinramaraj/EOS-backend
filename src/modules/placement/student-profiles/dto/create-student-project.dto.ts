import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStudentProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  /** The faculty who mentored this project, if any. */
  @IsOptional()
  @IsInt()
  @IsPositive()
  mentor_faculty_id?: number;
}
