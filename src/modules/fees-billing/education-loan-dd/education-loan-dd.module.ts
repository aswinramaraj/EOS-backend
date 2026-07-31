import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EducationLoanDdService } from './education-loan-dd.service';
import { EducationLoanDdController } from './education-loan-dd.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EducationLoanDdController],
  providers: [EducationLoanDdService],
})
export class EducationLoanDdModule {}
