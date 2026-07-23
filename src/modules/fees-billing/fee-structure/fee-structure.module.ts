import { Module } from '@nestjs/common';
import { FeeStructureService } from './fee-structure.service';
import { FeeStructureController } from './fee-structure.controller';

@Module({
  controllers: [FeeStructureController],
  providers: [FeeStructureService],
})
export class FeeStructureModule {}
