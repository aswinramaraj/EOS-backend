import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
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
 *
 * Every optional field below uses @ValidateIf(value !== undefined) rather
 * than @IsOptional(). @IsOptional() treats an explicit `null` the same as an
 * omitted field (skips validation), but MeProfileService treats `null` as
 * "field was provided, persist it" — that mismatch let a client send
 * `null` to silently wipe a previously-valid stored value with no
 * validation at all (confirmed live: a valid address_line/city was cleared
 * to NULL with a 200, no error). @ValidateIf keeps `undefined` (field
 * omitted) skipping validation as before, but now runs the real validators
 * against an explicit `null`, which correctly fails them — turning a
 * silent data-wipe into the same 400 VALIDATION_ERROR as any other
 * malformed value.
 */
export class UpdateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'address_type is required for each address entry' })
  address_type: string;

  @ValidateIf((o: UpdateAddressDto) => o.address_line !== undefined)
  @IsString()
  @MaxLength(500)
  address_line?: string;

  @ValidateIf((o: UpdateAddressDto) => o.city !== undefined)
  @IsString()
  @MaxLength(100)
  city?: string;

  @ValidateIf((o: UpdateAddressDto) => o.state !== undefined)
  @IsString()
  @MaxLength(100)
  state?: string;

  @ValidateIf((o: UpdateAddressDto) => o.pincode !== undefined)
  @IsString()
  @MaxLength(15)
  pincode?: string;
}

export class UpdateProfileDto {
  @ValidateIf((o: UpdateProfileDto) => o.student_email1 !== undefined)
  @IsEmail({}, { message: 'student_email1 must be a valid email' })
  student_email1?: string;

  @ValidateIf((o: UpdateProfileDto) => o.student_email2 !== undefined)
  @IsEmail({}, { message: 'student_email2 must be a valid email' })
  student_email2?: string;

  @ValidateIf((o: UpdateProfileDto) => o.student_mobile !== undefined)
  @Matches(/^\d{10}$/, { message: 'student_mobile must be exactly 10 digits' })
  student_mobile?: string;

  @ValidateIf((o: UpdateProfileDto) => o.addresses !== undefined)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  addresses?: UpdateAddressDto[];
}
