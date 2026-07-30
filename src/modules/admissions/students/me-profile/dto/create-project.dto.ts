import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

// Postgres int4 max — faculty.id is a plain Int column. Bounded up front
// (a lesson learned during the bonafide-requests recheck: an unbounded
// positive-integer check alone lets a value between this and
// Number.MAX_SAFE_INTEGER slip through validation and overflow at the DB
// layer, surfacing as an unhandled 500 instead of a clean 400).
const POSTGRES_INT4_MAX = 2147483647;

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(POSTGRES_INT4_MAX, {
    message: 'mentor_faculty_id is too large to be a valid id',
  })
  mentor_faculty_id?: number;
}
