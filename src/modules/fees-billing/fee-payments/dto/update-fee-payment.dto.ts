import { PartialType } from '@nestjs/mapped-types';
import { CreateFeePaymentDto } from './create-fee-payment.dto';

export class UpdateFeePaymentDto extends PartialType(CreateFeePaymentDto) {}
