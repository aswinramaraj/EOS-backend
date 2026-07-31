import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * POST /media-requests (Faculty only).
 *
 * workflow.md: "Faculties can request Poster designs and required media
 * related things." media_requests only stores a free-text description plus
 * the resulting file — there's no category/title/deadline column, so this
 * DTO is deliberately just `description`. `requested_by_faculty_id` and
 * `status` (always starts 'pending') are never client-supplied.
 */
export class CreateMediaRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
