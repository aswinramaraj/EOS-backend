import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { target_audience_enum } from '../../../../../generated/prisma/client';

export class UpdateAnnouncementDto {
  @ValidateIf((dto) => dto.title !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title?: string;

  @ValidateIf((dto) => dto.content !== undefined)
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ValidateIf((dto) => dto.target_audience !== undefined)
  @IsEnum(target_audience_enum)
  target_audience?: target_audience_enum;

  @ValidateIf((dto) => dto.class_ids !== undefined)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  class_ids?: number[];
}
