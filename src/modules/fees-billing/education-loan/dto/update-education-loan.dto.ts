import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationLoanDto } from './create-education-loan.dto';

export class UpdateEducationLoanDto extends PartialType(CreateEducationLoanDto) {}
