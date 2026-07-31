import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { soa_status_enum } from 'generated/prisma/client';

/**
 * The spec's example request body uses "fee_paid", but the real
 * `soa_status_enum` (prisma/schema.prisma) is `fees_paid` — validating
 * against the actual enum values here, not the spec's typo.
 */
const VALID_STATUSES = Object.values(soa_status_enum);

export class UpdateSoaStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'status is required' })
  @IsIn(VALID_STATUSES, {
    message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
  })
  status: soa_status_enum;
}
