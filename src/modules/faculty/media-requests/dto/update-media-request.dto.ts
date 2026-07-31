import { IsIn, IsOptional, IsUrl, MaxLength } from 'class-validator';

/**
 * PATCH /media-requests/:id (Media Room only).
 *
 * Intentionally NOT PartialType(CreateMediaRequestDto): this is a
 * state-machine transition (pending -> approved/rejected -> delivered), not
 * a free-form edit of the original request. workflow.md: "if request is
 * approved, the media is shared to the faculty through the request window
 * itself" — media_file_url is where that shared file lands, required when
 * (and only when) moving to 'delivered', enforced in the service since it
 * depends on the target status, not knowable from the DTO shape alone.
 */
export class UpdateMediaRequestDto {
  @IsIn(['approved', 'rejected', 'delivered'])
  status: 'approved' | 'rejected' | 'delivered';

  @IsOptional()
  @IsUrl({}, { message: 'media_file_url must be a valid URL' })
  @MaxLength(500)
  media_file_url?: string;
}
