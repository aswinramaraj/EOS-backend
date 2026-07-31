import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AppraisalService } from './appraisal.service';
import { AppraisalController } from './appraisal.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppraisalController],
  providers: [AppraisalService],
})
export class AppraisalModule {}
