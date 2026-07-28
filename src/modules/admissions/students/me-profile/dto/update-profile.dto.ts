import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * One entry of the `addresses` array on UpdateProfileDto.
 *
 * `address_type` is intentionally validated only for "present and a string" here.
 * Membership against the real `address_type_enum` values (permanent | temporary)
 * is checked in MeProfileService so a bad value can be reported as the
 * domain-specific 422 INVALID_ADDRESS_TYPE error instead of a generic 400
 * VALIDATION_ERROR from the global pipe.
 */
export class UpdateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'address_type is required for each address entry' })
  address_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address_line?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  pincode?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'student_email1 must be a valid email' })
  student_email1?: string;

  @IsOptional()
  @IsEmail({}, { message: 'student_email2 must be a valid email' })
  student_email2?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'student_mobile must be exactly 10 digits' })
  student_mobile?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  addresses?: UpdateAddressDto[];
}
