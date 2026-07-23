import { Module } from '@nestjs/common';
import { StudentLeavesService } from './student-leaves.service';
import { StudentLeavesController } from './student-leaves.controller';

@Module({
  controllers: [StudentLeavesController],
  providers: [StudentLeavesService],
})
export class StudentLeavesModule {}
