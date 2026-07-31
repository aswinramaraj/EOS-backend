import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_info?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  gst_no?: string;
}
