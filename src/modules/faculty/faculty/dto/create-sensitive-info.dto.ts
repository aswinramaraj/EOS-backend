import { IsOptional, IsString, Matches } from 'class-validator';

/**
 * HR-sensitive faculty details, collected once at onboarding.
 * Never returned in any API response — write-only.
 */
export class CreateSensitiveInfoDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{12}$/, { message: 'Aadhar number must be exactly 12 digits' })
  aadhar_number?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'PAN number must match the format AAAAA9999A',
  })
  pan_number?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,20}$/, {
    message: 'Bank account number must be 9-20 digits',
  })
  bank_account_number?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'IFSC code must match the format AAAA0999999',
  })
  bank_ifsc?: string;

  @IsOptional()
  @IsString()
  bank_name?: string;
}
