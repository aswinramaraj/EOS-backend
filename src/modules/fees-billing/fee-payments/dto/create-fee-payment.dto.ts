import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { payment_mode_enum } from '../../../../../generated/prisma/client';

export class CreateFeePaymentDto {
  @IsNumber()
  @Min(0)
  amount_paid: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  receipt_no: string;

  @IsOptional()
  @IsEnum(payment_mode_enum)
  payment_mode?: payment_mode_enum;

  @IsOptional()
  @IsBoolean()
  is_partial?: boolean;

  @IsOptional()
  @IsInt()
  collected_by_user_id?: number;
}
