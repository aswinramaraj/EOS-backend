import { IsInt, IsString, Matches } from 'class-validator';

/**
 * POST /classes/:id/mentor (HoD only).
 *
 * workflow.md: "HoD assigns the class with a respective faculty as Mentor,
 * the entire class students are mapped to the faculty." class_mentors has
 * @@unique([class_id, academic_year]) — one mentor per class per year.
 * assigned_by_user_id is never client-supplied — derived from the JWT.
 */
export class AssignMentorDto {
  @IsInt()
  faculty_id: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'academic_year must be in the format YYYY-YY, e.g. 2025-26',
  })
  academic_year: string;
}
