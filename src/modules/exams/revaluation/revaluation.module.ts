import { Module } from '@nestjs/common';
import { RevaluationService } from './revaluation.service';
import { RevaluationController } from './revaluation.controller';

@Module({
  controllers: [RevaluationController],
  providers: [RevaluationService],
})
export class RevaluationModule {}
