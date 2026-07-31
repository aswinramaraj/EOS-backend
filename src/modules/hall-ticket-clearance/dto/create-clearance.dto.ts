import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * POST /hall-ticket-clearance (Student only).
 *
 * student_id is never client-supplied, even though the spec's example body
 * includes it — derived from @CurrentUser().sub, same pattern as every
 * other self-service create in this codebase (Faculty Leaves, Payslip
 * Requests, etc.) — a student can only ever request clearance for themselves.
 */
export class CreateClearanceDto {
  @IsInt()
  exam_id: number;

  @IsEnum(['FEE_EXCEPTION', 'DOCUMENT_PENDING', 'OTHER'])
  clearance_type: 'FEE_EXCEPTION' | 'DOCUMENT_PENDING' | 'OTHER';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
