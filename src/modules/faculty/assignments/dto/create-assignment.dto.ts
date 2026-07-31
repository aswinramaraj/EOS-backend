import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * POST /assignments (Faculty only).
 *
 * faculty_id is never client-supplied — derived from @CurrentUser().sub.
 * The service verifies the caller is actually mapped
 * (faculty_subject_class_mapping) to teach subject_id for class_id before
 * allowing the row to be created.
 */
export class CreateAssignmentDto {
  @IsInt()
  class_id: number;

  @IsInt()
  subject_id: number;

  @IsString()
  academic_year: string;

  @IsInt()
  semester: number;

  @IsInt()
  @Min(1)
  sequence_no: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
