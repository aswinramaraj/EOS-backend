import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { clearance_type_enum } from '../../../../generated/prisma/enums';

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

  @IsEnum(clearance_type_enum)
  clearance_type: clearance_type_enum;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
