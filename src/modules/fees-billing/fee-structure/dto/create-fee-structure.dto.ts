import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { fee_structure_applies_to_enum } from '../../../../../generated/prisma/client';
import { CreateFeeStructureItemDto } from './create-fee-structure-item.dto';

export class CreateFeeStructureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsEnum(fee_structure_applies_to_enum)
  applies_to: fee_structure_applies_to_enum;

  @IsOptional()
  @IsInt()
  quota_id?: number;

  @IsString()
  @IsNotEmpty()
  academic_year: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFeeStructureItemDto)
  items: CreateFeeStructureItemDto[];
}
