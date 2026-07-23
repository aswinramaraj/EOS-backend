import { Module } from '@nestjs/common';
import { FacultyLeavesService } from './faculty-leaves.service';
import { FacultyLeavesController } from './faculty-leaves.controller';

@Module({
  controllers: [FacultyLeavesController],
  providers: [FacultyLeavesService],
})
export class FacultyLeavesModule {}
