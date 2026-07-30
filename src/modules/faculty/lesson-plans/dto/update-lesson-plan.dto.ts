import { IsNotEmpty, IsString } from 'class-validator';

/**
 * PATCH /lesson-plans/:id (Faculty only — and only the faculty who owns it).
 *
 * Intentionally NOT PartialType(CreateLessonPlanDto): `content` is the only
 * editable field. subject_id/class_id/semester identify WHICH lesson plan
 * this is (per the @@unique constraint) and are not reassignable after
 * creation — same principle as Faculty's own /profile update DTO.
 */
export class UpdateLessonPlanDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
