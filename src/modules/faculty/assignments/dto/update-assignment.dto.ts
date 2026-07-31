import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * PATCH /assignments/:id (Faculty only, own assignment).
 * Only `title` is editable — class_id/subject_id/academic_year/semester/
 * sequence_no identify WHICH assignment this is and aren't reassignable
 * after creation (same principle as every other module's identity fields).
 */
export class UpdateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
}
