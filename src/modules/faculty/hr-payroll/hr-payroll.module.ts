import { Module } from '@nestjs/common';
import { HrPayrollService } from './hr-payroll.service';
import { HrPayrollController } from './hr-payroll.controller';

@Module({
  controllers: [HrPayrollController],
  providers: [HrPayrollService],
})
export class HrPayrollModule {}
