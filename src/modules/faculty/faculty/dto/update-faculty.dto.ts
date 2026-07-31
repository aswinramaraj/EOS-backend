import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * PATCH /faculty/profile — the faculty's own self-service update.
 *
 * Intentionally NOT a PartialType(CreateFacultyDto): only the fields a faculty
 * member is allowed to change themselves belong here. user_id, department_id,
 * designation, status, created_at and date_of_joining are HR/admin-controlled
 * facts and must never appear on this DTO.
 */
export class UpdateFacultyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  last_name?: string;
}
