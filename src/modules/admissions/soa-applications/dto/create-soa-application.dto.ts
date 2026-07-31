import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * Field-level (400 VALIDATION_ERROR) checks only. Semantic range-checking of
 * cutoff_physics/chemistry/maths (0–100) happens in SoaApplicationsService,
 * which reports it as 422 INVALID_CUTOFF_RANGE per todo.md/1-POST-soa-applications.md
 * §5 — a distinct errorCode the global ValidationPipe can't produce on its own.
 */
export class CreateSoaApplicationDto {
  @IsString()
  @IsNotEmpty({ message: 'first_name is required' })
  @MaxLength(100)
  first_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  // Schema (prisma/schema.prisma) types father_name/mother_name as VarChar(150);
  // todo.md's table says "Max 100" for these two but that's inconsistent with the
  // actual column width. Validating against the real DB constraint (150) so a
  // legitimately long name isn't rejected by the API only to have fit the column.
  @IsOptional()
  @IsString()
  @MaxLength(150)
  father_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  mother_name?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'parent_contact must be exactly 10 digits' })
  parent_contact?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'student_contact must be exactly 10 digits' })
  student_contact?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'student_whatsapp must be exactly 10 digits',
  })
  student_whatsapp?: string;

  @IsOptional()
  @IsEmail({}, { message: 'student_email must be a valid email' })
  student_email?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'cutoff_physics must be a number' },
  )
  cutoff_physics?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'cutoff_chemistry must be a number' },
  )
  cutoff_chemistry?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'cutoff_maths must be a number' },
  )
  cutoff_maths?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  community?: string;
}
