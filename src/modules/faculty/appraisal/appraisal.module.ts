import { Module } from '@nestjs/common';
import { AppraisalService } from './appraisal.service';
import { AppraisalController } from './appraisal.controller';

@Module({
  controllers: [AppraisalController],
  providers: [AppraisalService],
})
export class AppraisalModule {}
