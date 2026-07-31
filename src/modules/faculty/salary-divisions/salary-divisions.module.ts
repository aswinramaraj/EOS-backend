import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SalaryDivisionsService } from './salary-divisions.service';
import { SalaryDivisionsController } from './salary-divisions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SalaryDivisionsController],
  providers: [SalaryDivisionsService],
})
export class SalaryDivisionsModule {}
