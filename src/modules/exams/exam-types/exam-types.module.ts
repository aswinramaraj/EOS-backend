import { Module } from '@nestjs/common';
import { ExamTypesService } from './exam-types.service';
import { ExamTypesController } from './exam-types.controller';

@Module({
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
})
export class ExamTypesModule {}
