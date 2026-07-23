import { Module } from '@nestjs/common';
import { HallPlansService } from './hall-plans.service';
import { HallPlansController } from './hall-plans.controller';

@Module({
  controllers: [HallPlansController],
  providers: [HallPlansService],
})
export class HallPlansModule {}
