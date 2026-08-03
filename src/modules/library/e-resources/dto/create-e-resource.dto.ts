import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export enum EResourceFormat {
  PDF = 'PDF',
  EPUB = 'EPUB',
  MOBI = 'MOBI',
  DOCX = 'DOCX',
  Other = 'Other',
}

export enum EResourceLicenseType {
  institution_licence = 'institution_licence',
  open_access = 'open_access',
  department_copy = 'department_copy',
  reference_only = 'reference_only',
}

export enum EResourcePublishState {
  draft = 'draft',
  published = 'published',
}

export class CreateEResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  /** The source file/link — following this codebase's existing convention
   * for delivered files (see media_requests.media_file_url,
   * purchase_orders.file_url): the client uploads to storage itself and
   * hands back a URL, the backend only ever stores metadata. */
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  category_id?: number;

  @IsOptional()
  @IsEnum(EResourceFormat)
  format?: EResourceFormat;

  @IsOptional()
  @IsInt()
  @Min(0)
  file_size_bytes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;

  @IsOptional()
  @IsEnum(EResourceLicenseType)
  license_type?: EResourceLicenseType;

  @IsOptional()
  @IsInt()
  @Min(1)
  concurrent_seats?: number;

  @IsOptional()
  @IsEnum(EResourcePublishState)
  publish_state?: EResourcePublishState;
}
