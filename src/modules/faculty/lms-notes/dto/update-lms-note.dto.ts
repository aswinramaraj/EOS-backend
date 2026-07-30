import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * PATCH /lms-notes/:id (Faculty only — and only the faculty who owns it).
 *
 * Intentionally NOT PartialType(CreateLmsNoteDto): `title` and `file_url` are
 * the only editable fields. subject_id/class_id identify WHICH note this is
 * and are not reassignable after creation — same principle as Lesson Plans'
 * update DTO.
 */
export class UpdateLmsNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsUrl({}, { message: 'file_url must be a valid URL' })
  @MaxLength(500)
  file_url?: string;
}
