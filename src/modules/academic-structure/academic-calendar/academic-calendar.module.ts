import { Module } from '@nestjs/common';
import { AcademicCalendarService } from './academic-calendar.service';
import { AcademicCalendarController } from './academic-calendar.controller';

@Module({
  controllers: [AcademicCalendarController],
  providers: [AcademicCalendarService],
})
export class AcademicCalendarModule {}
