import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HrPayrollService } from './hr-payroll.service';
import { HrPayrollController } from './hr-payroll.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HrPayrollController],
  providers: [HrPayrollService],
})
export class HrPayrollModule {}
