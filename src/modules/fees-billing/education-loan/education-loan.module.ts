import { Module } from '@nestjs/common';
import { EducationLoanService } from './education-loan.service';
import { EducationLoanController } from './education-loan.controller';

@Module({
  controllers: [EducationLoanController],
  providers: [EducationLoanService],
})
export class EducationLoanModule {}
