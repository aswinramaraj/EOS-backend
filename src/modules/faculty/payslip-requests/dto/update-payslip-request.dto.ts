import { IsIn, IsOptional, IsUrl, MaxLength } from 'class-validator';

/**
 * PATCH /payslip-requests/:id (HR Payroll only).
 *
 * A state-machine transition (pending -> processed/rejected), not a
 * free-form edit — same shape as Media Requests' review DTO. `file_url` is
 * required exactly when marking a request 'processed' (that's the payslip
 * file being delivered); not accepted/required for 'rejected'.
 */
export class UpdatePayslipRequestDto {
  @IsIn(['processed', 'rejected'])
  status: 'processed' | 'rejected';

  @IsOptional()
  @IsUrl({}, { message: 'file_url must be a valid URL' })
  @MaxLength(500)
  file_url?: string;
}
