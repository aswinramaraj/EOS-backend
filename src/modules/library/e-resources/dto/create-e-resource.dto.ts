import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  category_id?: number;
}
